import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    likedProducts: [{ type: String }], // ids de produits favoris (synchronisés une fois connecté)
    consent: {
      cookies: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      acceptedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
