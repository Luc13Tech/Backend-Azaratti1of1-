import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  id: { type: String, required: true },
  hex: { type: String, required: true },
  label: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    es: { type: String, required: true },
    de: { type: String, required: true },
  },
});

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  
  // ✅ Optionnel (pas de numérotation)
  edition: { type: String, required: false, default: "" },
  
  images: { type: [String], required: true },
  colors: { type: [colorSchema], required: true },
  sizes: { type: [String], required: true },
  category: { type: String, required: true },
  
  // ✅ Prix en USD uniquement
  priceUSD: { type: Number, required: true },
  
  // ✅ Optionnel pour compatibilité
  priceEUR: { type: Number, required: false, default: 450 },
  
  name: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    es: { type: String, required: true },
    de: { type: String, required: true },
  },
  description: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    es: { type: String, required: true },
    de: { type: String, required: true },
  },
}, { timestamps: true });

// Index pour les recherches
productSchema.index({ productId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ priceUSD: 1 });
productSchema.index({ "name.fr": "text", "name.en": "text" });

export default mongoose.model("Product", productSchema);
