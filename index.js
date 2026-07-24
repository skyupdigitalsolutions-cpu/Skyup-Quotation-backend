import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { connectDB, MONGO_URI } from "./db.js";
import User from "./models/User.js";
import Quotation from "./models/Quotation.js";
import Template from "./models/Template.js";
import { seedTemplatesIfEmpty } from "./seedTemplates.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));

app.use(
  session({
    name: "skyup.sid",
    secret: process.env.SESSION_SECRET || "skyup-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI, collectionName: "sessions" }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

/* ---------------------------------- Auth ---------------------------------- */

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

async function requireAdmin(req, res, next) {
  const user = await User.findById(req.session.userId);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Only an admin can do this" });
  next();
}

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: "An account with that email already exists" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash });

    req.session.userId = user._id.toString();
    res.status(201).json({ user });
  } catch (e) {
    res.status(500).json({ error: "Could not sign up", detail: String(e.message || e) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    req.session.userId = user._id.toString();
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: "Could not log in", detail: String(e.message || e) });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("skyup.sid");
    res.json({ ok: true });
  });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user });
});

// The whole team, so the UI can group quotations by member and show everyone
// even before they've saved anything yet.
app.get("/api/team", requireAuth, async (req, res) => {
  const users = await User.find().select("name email role").sort({ createdAt: 1 });
  res.json(users);
});

/* ------------------------------- Quotations ------------------------------- */
// Shared across the whole team: everyone signed in can view, load and
// download any quotation. Only an admin account can delete one.

app.get("/api/quotations", requireAuth, async (req, res) => {
  const rows = await Quotation.find()
    .select("title created_at updated_at parentId owner")
    .populate("owner", "name")
    .sort({ updated_at: -1 });
  res.json(
    rows.map((r) => ({
      id: r._id,
      title: r.title,
      parentId: r.parentId,
      created_at: r.created_at,
      updated_at: r.updated_at,
      ownerId: r.owner?._id,
      ownerName: r.owner?.name || "Unknown"
    }))
  );
});

app.get("/api/quotations/:id", requireAuth, async (req, res) => {
  const row = await Quotation.findById(req.params.id).populate("owner", "name");
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({
    id: row._id,
    title: row.title,
    data: row.data,
    parentId: row.parentId,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ownerId: row.owner?._id,
    ownerName: row.owner?.name || "Unknown"
  });
});

// Every save creates its own history entry. Saving over an existing quotation
// (parentId set) keeps the earlier version intact instead of overwriting it.
app.post("/api/quotations", requireAuth, async (req, res) => {
  const { title, data, parentId } = req.body;
  if (!data) return res.status(400).json({ error: "data is required" });
  const row = await Quotation.create({
    title: title || "Untitled quotation",
    data,
    owner: req.session.userId,
    parentId: parentId || null
  });
  res.status(201).json({ id: row._id, title: row.title, data: row.data, parentId: row.parentId, created_at: row.created_at, updated_at: row.updated_at });
});

app.delete("/api/quotations/:id", requireAuth, requireAdmin, async (req, res) => {
  await Quotation.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

/* -------------------------------- Templates ------------------------------- */
// Shared catalog of service packages, visible to every signed-in user.

app.get("/api/templates", requireAuth, async (req, res) => {
  const rows = await Template.find().sort({ sort: 1, _id: 1 });
  res.json(
    rows.map((r) => ({
      id: r._id,
      tkey: r.tkey,
      category: r.category,
      name: r.name,
      deliv: r.deliv,
      price: r.price,
      unit: r.unit,
      note: r.note
    }))
  );
});

app.post("/api/templates", requireAuth, async (req, res) => {
  const { tkey, category, name, deliv, price, unit, note } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const key = (tkey || name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const maxSortDoc = await Template.findOne().sort({ sort: -1 }).select("sort");
  const maxSort = maxSortDoc ? maxSortDoc.sort : 0;
  try {
    const row = await Template.create({
      tkey: key,
      category: category || "Other",
      name,
      deliv: deliv || "",
      price: price || 0,
      unit: unit || "onetime",
      note: note || "",
      sort: maxSort + 1
    });
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: "Could not create template (duplicate key?)", detail: String(e.message || e) });
  }
});

app.put("/api/templates/:id", requireAuth, async (req, res) => {
  const { category, name, deliv, price, unit, note } = req.body;
  const row = await Template.findByIdAndUpdate(
    req.params.id,
    { category, name, deliv: deliv || "", price: price || 0, unit: unit || "onetime", note: note || "" },
    { new: true }
  );
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.delete("/api/templates/:id", requireAuth, async (req, res) => {
  await Template.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

/* --------------------------- Serve built frontend -------------------------- */
// In production (npm run build in /client), serve the static dist folder.
const distDir = join(__dirname, "..", "client", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => res.sendFile(join(distDir, "index.html")));
} else {
  // Backend-only deploy (e.g. Railway): give the root a friendly response
  // so hitting the URL confirms the API is up instead of "Cannot GET /".
  app.get("/", (req, res) => {
    res.json({ status: "ok", service: "skyup-quotation-api" });
  });
}

connectDB()
  .then(seedTemplatesIfEmpty)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Skyup Quotation API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
