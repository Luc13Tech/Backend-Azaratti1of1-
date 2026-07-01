import Order from "../models/Order.js";

// Enregistre une commande au moment où le client est redirigé vers WhatsApp
// (garde un historique côté entreprise, même si le paiement se finalise sur WhatsApp)
export async function createOrder(req, res, next) {
  try {
    const { items, totalUSD, guestName, guestContact } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: "Le panier est vide." });
    }
    const order = await Order.create({
      user: req.user ? req.user.id : null,
      guestName: guestName || null,
      guestContact: guestContact || null,
      items,
      totalUSD,
    });
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}
