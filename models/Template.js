import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  tkey: { type: String, required: true, unique: true },
  category: { type: String, required: true, default: "Other" },
  name: { type: String, required: true },
  deliv: { type: String, default: "" },
  price: { type: Number, default: 0 },
  unit: { type: String, default: "onetime" },
  note: { type: String, default: "" },
  sort: { type: Number, default: 0 }
});

export default mongoose.model("Template", templateSchema);
