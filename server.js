import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./src/config/db.js";
import { globalLimiter } from "./src/middleware/rateLimit.middleware.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/auth.routes.js";
import productsRoutes from "./src/routes/products.routes.js";
import ordersRoutes from "./src/routes/orders.routes.js";
import customRoutes from "./src/routes/custom.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import likesRoutes from "./src/routes/likes.routes.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(globalLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "azaratti-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/custom-request", customRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/likes", likesRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`AzaRatti backend en écoute sur le port ${PORT}`));
});
