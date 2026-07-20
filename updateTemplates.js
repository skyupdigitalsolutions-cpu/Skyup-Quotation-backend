// updateTemplates.js — one-off script to sync changed built-in templates to the DB.
//
// Why this exists: seedTemplates.js only inserts when the collection is EMPTY
// (`if (count > 0) return`), so it never updates an existing template. This script
// updates the specific template(s) that changed, without touching anything else.
//
// Run it ONCE, from inside the server folder (where .env and db.js live):
//     node updateTemplates.js
//
// IMPORTANT: it writes to whatever MONGO_URI is in your .env. Make sure that is your
// PRODUCTION Atlas connection string if you want the change to show on the live site.

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Template from "./models/Template.js";

// Templates whose wording changed. Add more objects here if others change later.
const updates = [
  {
    tkey: "ai_chatbot",
    set: {
      category: "AI Automation",
      name: "WhatsApp Automation & AI Chatbot",
      deliv:
        "WhatsApp Business Integration:\n" +
        "• WhatsApp Business API setup\n" +
        "• Send & receive messages\n" +
        "• Bulk messaging templates configuration\n" +
        "• Production-ready integration",
      price: 0,
      unit: "onetime",
      note: "Pricing as per your requirements"
    }
  }
];

async function run() {
  await connectDB();

  for (const u of updates) {
    const res = await Template.updateOne(
      { tkey: u.tkey },
      { $set: u.set },
      { upsert: true } // create it if it somehow doesn't exist yet
    );

    if (res.upsertedCount) console.log(`created template "${u.tkey}"`);
    else if (res.modifiedCount) console.log(`updated template "${u.tkey}"`);
    else console.log(`template "${u.tkey}" already up to date`);
  }

  await mongoose.connection.close();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Update failed:", err.message);
  process.exit(1);
});