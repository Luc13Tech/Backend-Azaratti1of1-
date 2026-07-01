import { Router } from "express";
import { body } from "express-validator";
import { createCustomRequest } from "../controllers/custom.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { formLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/",
  formLimiter,
  optionalAuth,
  [
    body("name").trim().notEmpty().withMessage("Le nom est requis."),
    body("email").isEmail().withMessage("Email invalide."),
    body("instructions").trim().notEmpty().withMessage("Les instructions sont requises."),
  ],
  validate,
  createCustomRequest
);

export default router;
