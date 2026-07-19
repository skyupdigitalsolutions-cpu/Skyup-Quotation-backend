import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "Untitled quotation" },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // The version this was saved from, if any — lets history show every save as its own entry.
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation", default: null }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model("Quotation", quotationSchema);
