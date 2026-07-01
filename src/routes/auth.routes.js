import { Router } from "express";
import { body } from "express-validator";
import { signup, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/signup",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Le nom est requis."),
    body("email").isEmail().withMessage("Email invalide."),
    body("password").isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères."),
  ],
  validate,
  signup
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Email invalide."),
    body("password").notEmpty().withMessage("Mot de passe requis."),
  ],
  validate,
  login
);

router.get("/me", requireAuth, me);

export default router;
