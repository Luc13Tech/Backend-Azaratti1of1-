import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    size: { type: String },
    color: { type: String },
    fabric: { type: String },
    instructions: { type: String, required: true },
    relatedProductId: { type: String }, // si la demande part d'une fiche produit existante
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "completed", "cancelled"],
      default: "new",
    },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("CustomRequest", customRequestSchema);
