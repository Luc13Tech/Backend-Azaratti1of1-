import mongoose from "mongoose";

const multilingual = {
  fr: { type: String, required: true },
  en: { type: String, required: true },
  es: { type: String, required: true },
  de: { type: String, required: true },
};

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true }, // ex: "veste-01"
    edition: { type: String, required: true }, // ex: "N°01/15"
    sku: { type: String, required: true },
    name: multilingual,
    description: multilingual,
    priceUSD: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    colors: [
      {
        id: String,
        hex: String,
        label: {
          fr: String, en: String, es: String, de: String,
        },
      },
    ],
    sizes: [{ type: String }],
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
