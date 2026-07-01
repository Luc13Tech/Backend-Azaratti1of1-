import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    edition: String,
    color: String,
    size: String,
    qty: Number,
    priceUSD: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null si invité
    guestName: { type: String },
    guestContact: { type: String },
    items: [orderItemSchema],
    totalUSD: { type: Number, required: true },
    status: {
      type: String,
      enum: ["sent_to_whatsapp", "confirmed", "in_progress", "completed", "cancelled"],
      default: "sent_to_whatsapp",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
