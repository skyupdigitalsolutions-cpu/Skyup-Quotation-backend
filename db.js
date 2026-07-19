import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skyup_quotation";

mongoose.connection.on("connected", () => {
  console.log(`MongoDB connected -> ${MONGO_URI}`);
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  return mongoose.connection;
}

export { MONGO_URI };
export default mongoose;
