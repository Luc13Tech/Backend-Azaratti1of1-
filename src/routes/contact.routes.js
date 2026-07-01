import { Router } from "express";
import { body } from "express-validator";
import { createContactMessage } from "../controllers/contact.controller.js";
import { formLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/",
  formLimiter,
  [
    body("name").trim().notEmpty().withMessage("Le nom est requis."),
    body("email").isEmail().withMessage("Email invalide."),
    body("message").trim().notEmpty().withMessage("Le message est requis."),
  ],
  validate,
  createContactMessage
);

export default router;
