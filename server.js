import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./src/config/db.js";
import { globalLimiter } from "./src/middleware/rateLimit.middleware.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";
import Product from "./src/models/Product.js";

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
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur le backend AzaRatti 1of1",
    endpoints: { auth: "/api/auth", products: "/api/products", orders: "/api/orders", customRequest: "/api/custom-request", contact: "/api/contact", likes: "/api/likes" }
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "azaratti-backend" }));

/* ─── ROUTE SEED (protégée par clé) ─── */
app.get("/api/seed-init", async (req, res) => {
  if (req.query.key !== "azaratti-seed-2026") {
    return res.status(403).json({ error: "Accès refusé." });
  }
  const defaultColors = [
    { id: "noir",     hex: "#161412", label: { fr: "Noir",      en: "Black",     es: "Negro",        de: "Schwarz"     } },
    { id: "marine",   hex: "#1c2438", label: { fr: "Bleu Marine",en: "Navy",     es: "Azul marino",  de: "Marineblau"  } },
    { id: "bordeaux", hex: "#5c1626", label: { fr: "Bordeaux",  en: "Burgundy",  es: "Burdeos",      de: "Bordeaux"    } },
  ];
  const sizes = ["XS","S","M","L","XL","XXL","Sur mesure"];
  const p = (n, opts) => {
    const id = String(n).padStart(2,"0");
    return { productId:`veste-${id}`, edition:`N°${id}/15`, sku:`AZR-${id}`,
      images:[`/images/produits/veste-${id}/main.jpg`,`/images/produits/veste-${id}/2.jpg`,`/images/produits/veste-${id}/3.jpg`],
      colors: defaultColors, sizes, category: opts.category || "vestes",
      priceUSD: opts.priceUSD, name: opts.name, description: opts.description };
  };
  const products = [
    p(1,{priceUSD:1850,category:"vestes",name:{fr:"Veste Aza Noire Sculptée",en:"Aza Sculpted Black Jacket",es:"Chaqueta Aza Negra Esculpida",de:"Aza Skulptierte Schwarze Jacke"},description:{fr:"Pièce unique taillée à la main, structure sculpturale.",en:"Hand-tailored one-off piece with sculptural structure.",es:"Pieza única confeccionada a mano.",de:"Handgefertigtes Einzelstück."}}),
    p(2,{priceUSD:2100,category:"vestes",name:{fr:"Veste Ratti Bordeaux Royale",en:"Ratti Royal Burgundy Jacket",es:"Chaqueta Ratti Burdeos Real",de:"Ratti Königliche Bordeauxjacke"},description:{fr:"Bordeaux profond, col cranté large, doublure en soie.",en:"Deep burgundy, wide notched lapel, silk lining.",es:"Burdeos profundo, solapa ancha.",de:"Tiefes Bordeaux, breites Revers."}}),
    p(3,{priceUSD:2600,category:"smoking",name:{fr:"Smoking Édition Azaratti",en:"Azaratti Edition Tuxedo",es:"Esmoquin Edición Azaratti",de:"Azaratti Edition Smoking"},description:{fr:"Smoking croisé en laine vierge, revers satin.",en:"Double-breasted virgin wool tuxedo.",es:"Esmoquin cruzado de lana virgen.",de:"Zweireihiger Smoking."}}),
    p(4,{priceUSD:1700,category:"tweed",name:{fr:"Veste Tweed Ndoye",en:"Ndoye Tweed Jacket",es:"Chaqueta Tweed Ndoye",de:"Ndoye Tweedjacke"},description:{fr:"Tweed chiné tissé à la main, boutons corne véritable.",en:"Hand-woven tweed, horn buttons.",es:"Tweed tejido a mano.",de:"Handgewebter Tweed."}}),
    p(5,{priceUSD:1950,category:"vestes",name:{fr:"Veste Azaratti Onyx",en:"Azaratti Onyx Jacket",es:"Chaqueta Azaratti Ónix",de:"Azaratti Onyx Jacke"},description:{fr:"Noir profond texturé, ligne épurée.",en:"Deep textured black, clean line.",es:"Negro texturizado.",de:"Tiefes Schwarz."}}),
    p(6,{priceUSD:2300,category:"vestes",name:{fr:"Veste Croisée Lagune",en:"Lagoon Double-Breasted Jacket",es:"Chaqueta Cruzada Laguna",de:"Lagune Zweireiherjacke"},description:{fr:"Bleu lagune profond, coupe croisée.",en:"Deep lagoon blue, double-breasted.",es:"Azul laguna, cruzada.",de:"Lagunenblau, zweireihig."}}),
    p(7,{priceUSD:2450,category:"smoking",name:{fr:"Veste Smoking Velours",en:"Velvet Tuxedo Jacket",es:"Chaqueta Esmoquin Terciopelo",de:"Samt-Smokingjacke"},description:{fr:"Velours profond, col châle satin.",en:"Deep velvet, satin shawl collar.",es:"Terciopelo, cuello chal.",de:"Samt, Schalkragen."}}),
    p(8,{priceUSD:1800,category:"tweed",name:{fr:"Veste Tweed Héritage",en:"Heritage Tweed Jacket",es:"Chaqueta Tweed Herencia",de:"Heritage Tweedjacke"},description:{fr:"Motif chevrons, coupe ajustée.",en:"Herringbone, fitted cut.",es:"Espiga, ajustado.",de:"Fischgrät, schmal."}}),
    p(9,{priceUSD:2050,category:"vestes",name:{fr:"Veste Azaratti Ivoire",en:"Azaratti Ivory Jacket",es:"Chaqueta Azaratti Marfil",de:"Azaratti Elfenbein Jacke"},description:{fr:"Ivoire texturé, doublure brodée.",en:"Textured ivory, embroidered lining.",es:"Marfil texturizado.",de:"Elfenbein strukturiert."}}),
    p(10,{priceUSD:1900,category:"vestes",name:{fr:"Veste Graphique Sahel",en:"Sahel Graphic Jacket",es:"Chaqueta Gráfica Sahel",de:"Sahel Grafikjacke"},description:{fr:"Motifs inspirés du Sahel.",en:"Sahel-inspired patterns.",es:"Patrones del Sahel.",de:"Sahel-inspiriert."}}),
    p(11,{priceUSD:2700,category:"smoking",name:{fr:"Smoking Minuit",en:"Midnight Tuxedo",es:"Esmoquin Medianoche",de:"Mitternachts-Smoking"},description:{fr:"Noir absolu, revers pointu satin.",en:"Absolute black, peak lapel.",es:"Negro absoluto.",de:"Absolutes Schwarz."}}),
    p(12,{priceUSD:1750,category:"tweed",name:{fr:"Veste Tweed Caramel",en:"Caramel Tweed Jacket",es:"Chaqueta Tweed Caramelo",de:"Karamell Tweedjacke"},description:{fr:"Tons chauds, texture riche.",en:"Warm tones, rich texture.",es:"Tonos cálidos.",de:"Warme Töne."}}),
    p(13,{priceUSD:2200,category:"vestes",name:{fr:"Veste Azaratti Emeraude",en:"Azaratti Emerald Jacket",es:"Chaqueta Azaratti Esmeralda",de:"Azaratti Smaragdjacke"},description:{fr:"Vert émeraude, col officier.",en:"Emerald green, officer collar.",es:"Verde esmeralda.",de:"Smaragdgrün."}}),
    p(14,{priceUSD:2150,category:"vestes",name:{fr:"Veste Croisée Anthracite",en:"Anthracite Double-Breasted Jacket",es:"Chaqueta Cruzada Antracita",de:"Anthrazit Zweireiherjacke"},description:{fr:"Anthracite chiné, boutonnage croisé.",en:"Mottled anthracite, double-breasted.",es:"Antracita jaspeado.",de:"Anthrazit, zweireihig."}}),
    p(15,{priceUSD:2900,category:"vestes",name:{fr:"Veste Azaratti Or Antique",en:"Azaratti Antique Gold Jacket",es:"Chaqueta Azaratti Oro Antiguo",de:"Azaratti Antikgold Jacke"},description:{fr:"Fils dorés tissés à la main, pièce unique.",en:"Hand-woven gold threads, unique.",es:"Hilos dorados.",de:"Goldfäden."}}),
  ];
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    res.json({ success: true, message: "15 produits insérés avec succès dans MongoDB." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
