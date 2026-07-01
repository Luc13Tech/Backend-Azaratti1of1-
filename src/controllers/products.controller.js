import Product from "../models/Product.js";

export async function listProducts(req, res, next) {
  try {
    const { category, q } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (q) {
      filter.$or = [
        { "name.fr": { $regex: q, $options: "i" } },
        { "name.en": { $regex: q, $options: "i" } },
        { "name.es": { $regex: q, $options: "i" } },
        { "name.de": { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
      ];
    }
    const products = await Product.find(filter).sort({ productId: 1 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({ productId: req.params.id });
    if (!product) return res.status(404).json({ error: "Pièce introuvable." });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}
