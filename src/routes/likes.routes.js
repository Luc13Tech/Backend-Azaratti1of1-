import { Router } from "express";
import { body } from "express-validator";
import { getMyLikes, toggleLike } from "../controllers/likes.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", requireAuth, getMyLikes);
router.post(
  "/toggle",
  requireAuth,
  [body("productId").trim().notEmpty().withMessage("productId requis.")],
  validate,
  toggleLike
);

export default router;
