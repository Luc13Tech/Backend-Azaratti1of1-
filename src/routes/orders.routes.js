import { Router } from "express";
import { body } from "express-validator";
import { createOrder, listMyOrders } from "../controllers/orders.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/",
  optionalAuth,
  [
    body("items").isArray({ min: 1 }).withMessage("Le panier est vide."),
    body("totalUSD").isNumeric().withMessage("Total invalide."),
  ],
  validate,
  createOrder
);

router.get("/my-orders", requireAuth, listMyOrders);

export default router;
