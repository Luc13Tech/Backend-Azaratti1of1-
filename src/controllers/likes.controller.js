import User from "../models/User.js";

export async function getMyLikes(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("likedProducts");
    res.json({ likedProducts: user?.likedProducts || [] });
  } catch (err) {
    next(err);
  }
}

export async function toggleLike(req, res, next) {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const idx = user.likedProducts.indexOf(productId);
    if (idx === -1) {
      user.likedProducts.push(productId);
    } else {
      user.likedProducts.splice(idx, 1);
    }
    await user.save();
    res.json({ likedProducts: user.likedProducts });
  } catch (err) {
    next(err);
  }
}
