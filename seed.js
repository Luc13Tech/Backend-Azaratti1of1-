// seed.js
// Lance ce script une fois pour remplir la base de données avec les 15 vestes.
// Commande : node seed.js
//
// Les données sont une copie de /azaratti1of1/src/data/siteData.js (frontend).
// Si tu modifies les produits côté frontend, pense à répercuter les changements ici,
// ou à terme, à supprimer le mirroring des produits côté frontend et tout charger
// depuis l'API (GET /api/products) pour n'avoir qu'une seule source de vérité.

import "dotenv/config";
import mongoose from "mongoose";
import Product from "./src/models/Product.js";

const defaultColors = [
  { id: "noir", hex: "#161412", label: { fr: "Noir", en: "Black", es: "Negro", de: "Schwarz" } },
  { id: "marine", hex: "#1c2438", label: { fr: "Bleu Marine", en: "Navy", es: "Azul marino", de: "Marineblau" } },
  { id: "bordeaux", hex: "#5c1626", label: { fr: "Bordeaux", en: "Burgundy", es: "Burdeos", de: "Bordeaux" } },
];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Sur mesure"];

function p(n, opts) {
  const id = String(n).padStart(2, "0");
  return {
    productId: `veste-${id}`,
    edition: `N°${id}/15`,
    sku: `AZR-${id}`,
    images: [
      `/images/produits/veste-${id}/main.jpg`,
      `/images/produits/veste-${id}/2.jpg`,
      `/images/produits/veste-${id}/3.jpg`,
    ],
    colors: defaultColors,
    sizes,
    category: opts.category || "vestes",
    priceUSD: opts.priceUSD,
    name: opts.name,
    description: opts.description,
  };
}

const products = [
  p(1, { priceUSD: 1850, category: "vestes",
    name: { fr: "Veste Aza Noire Sculptée", en: "Aza Sculpted Black Jacket", es: "Chaqueta Aza Negra Esculpida", de: "Aza Skulptierte Schwarze Jacke" },
    description: { fr: "Pièce unique taillée à la main, structure sculpturale et finitions soignées.", en: "Hand-tailored one-off piece with sculptural structure.", es: "Pieza única confeccionada a mano, estructura escultural.", de: "Handgefertigtes Einzelstück mit skulpturaler Struktur." } }),
  p(2, { priceUSD: 2100, category: "vestes",
    name: { fr: "Veste Ratti Bordeaux Royale", en: "Ratti Royal Burgundy Jacket", es: "Chaqueta Ratti Burdeos Real", de: "Ratti Königliche Bordeauxjacke" },
    description: { fr: "Bordeaux profond, col cranté large, doublure en soie.", en: "Deep burgundy, wide notched lapel, silk lining.", es: "Burdeos profundo, solapa ancha, forro de seda.", de: "Tiefes Bordeaux, breites Revers, Seidenfutter." } }),
  p(3, { priceUSD: 2600, category: "smoking",
    name: { fr: "Smoking Édition Azaratti", en: "Azaratti Edition Tuxedo", es: "Esmoquin Edición Azaratti", de: "Azaratti Edition Smoking" },
    description: { fr: "Smoking croisé en laine vierge, revers satin.", en: "Double-breasted virgin wool tuxedo, satin lapel.", es: "Esmoquin cruzado de lana virgen, solapa de satén.", de: "Zweireihiger Smoking aus Schurwolle, Satinrevers." } }),
  p(4, { priceUSD: 1700, category: "tweed",
    name: { fr: "Veste Tweed Ndoye", en: "Ndoye Tweed Jacket", es: "Chaqueta Tweed Ndoye", de: "Ndoye Tweedjacke" },
    description: { fr: "Tweed chiné tissé à la main, boutons corne véritable.", en: "Hand-woven mottled tweed, genuine horn buttons.", es: "Tweed jaspeado tejido a mano, botones de cuerno.", de: "Handgewebter melierter Tweed, echte Hornknöpfe." } }),
  p(5, { priceUSD: 1950, category: "vestes",
    name: { fr: "Veste Azaratti Onyx", en: "Azaratti Onyx Jacket", es: "Chaqueta Azaratti Ónix", de: "Azaratti Onyx Jacke" },
    description: { fr: "Noir profond texturé, ligne épurée, pièce signature.", en: "Deep textured black, clean line, signature piece.", es: "Negro profundo texturizado, línea depurada.", de: "Tiefes strukturiertes Schwarz, klare Linie." } }),
  p(6, { priceUSD: 2300, category: "vestes",
    name: { fr: "Veste Croisée Lagune", en: "Lagoon Double-Breasted Jacket", es: "Chaqueta Cruzada Laguna", de: "Lagune Zweireiherjacke" },
    description: { fr: "Bleu lagune profond, coupe croisée, boutons dorés gravés.", en: "Deep lagoon blue, double-breasted cut, engraved gold buttons.", es: "Azul laguna profundo, corte cruzado.", de: "Tiefes Lagunenblau, zweireihiger Schnitt." } }),
  p(7, { priceUSD: 2450, category: "smoking",
    name: { fr: "Veste Smoking Velours", en: "Velvet Tuxedo Jacket", es: "Chaqueta Esmoquin de Terciopelo", de: "Samt-Smokingjacke" },
    description: { fr: "Velours profond, col châle satin.", en: "Deep velvet, satin shawl collar.", es: "Terciopelo profundo, cuello chal de satén.", de: "Tiefer Samt, Satin-Schalkragen." } }),
  p(8, { priceUSD: 1800, category: "tweed",
    name: { fr: "Veste Tweed Héritage", en: "Heritage Tweed Jacket", es: "Chaqueta Tweed Herencia", de: "Heritage Tweedjacke" },
    description: { fr: "Motif chevrons, coupe ajustée, façonnée à la main.", en: "Herringbone pattern, fitted cut, hand-shaped.", es: "Motivo de espiga, corte ajustado.", de: "Fischgrätmuster, schmaler Schnitt." } }),
  p(9, { priceUSD: 2050, category: "vestes",
    name: { fr: "Veste Azaratti Ivoire", en: "Azaratti Ivory Jacket", es: "Chaqueta Azaratti Marfil", de: "Azaratti Elfenbein Jacke" },
    description: { fr: "Ivoire texturé rare, doublure brodée du monogramme.", en: "Rare textured ivory, monogram-embroidered lining.", es: "Marfil texturizado raro, forro bordado.", de: "Seltenes strukturiertes Elfenbein, besticktes Futter." } }),
  p(10, { priceUSD: 1900, category: "vestes",
    name: { fr: "Veste Graphique Sahel", en: "Sahel Graphic Jacket", es: "Chaqueta Gráfica Sahel", de: "Sahel Grafikjacke" },
    description: { fr: "Motifs graphiques inspirés du Sahel, coupe contemporaine.", en: "Graphic patterns inspired by the Sahel.", es: "Patrones gráficos inspirados en el Sahel.", de: "Grafische Muster inspiriert vom Sahel." } }),
  p(11, { priceUSD: 2700, category: "smoking",
    name: { fr: "Smoking Minuit", en: "Midnight Tuxedo", es: "Esmoquin Medianoche", de: "Mitternachts-Smoking" },
    description: { fr: "Noir absolu, revers pointu satin.", en: "Absolute black, satin peak lapel.", es: "Negro absoluto, solapa de pico de satén.", de: "Absolutes Schwarz, spitzes Satinrevers." } }),
  p(12, { priceUSD: 1750, category: "tweed",
    name: { fr: "Veste Tweed Caramel", en: "Caramel Tweed Jacket", es: "Chaqueta Tweed Caramelo", de: "Karamell Tweedjacke" },
    description: { fr: "Tons chauds, texture riche, poches plaquées.", en: "Warm tones, rich texture, patch pockets.", es: "Tonos cálidos, textura rica.", de: "Warme Töne, reiche Textur." } }),
  p(13, { priceUSD: 2200, category: "vestes",
    name: { fr: "Veste Azaratti Emeraude", en: "Azaratti Emerald Jacket", es: "Chaqueta Azaratti Esmeralda", de: "Azaratti Smaragdjacke" },
    description: { fr: "Vert émeraude profond, col officier brodé.", en: "Deep emerald green, embroidered officer collar.", es: "Verde esmeralda profundo, cuello oficial.", de: "Tiefes Smaragdgrün, bestickter Stehkragen." } }),
  p(14, { priceUSD: 2150, category: "vestes",
    name: { fr: "Veste Croisée Anthracite", en: "Anthracite Double-Breasted Jacket", es: "Chaqueta Cruzada Antracita", de: "Anthrazit Zweireiherjacke" },
    description: { fr: "Anthracite chiné, ligne stricte, boutonnage croisé.", en: "Mottled anthracite, sharp line, double-breasted.", es: "Antracita jaspeado, línea estricta.", de: "Meliertes Anthrazit, strenge Linie." } }),
  p(15, { priceUSD: 2900, category: "vestes",
    name: { fr: "Veste Azaratti Or Antique", en: "Azaratti Antique Gold Jacket", es: "Chaqueta Azaratti Oro Antiguo", de: "Azaratti Antikgold Jacke" },
    description: { fr: "La pièce ultime — fils dorés tissés à la main, série unique close à 1 exemplaire.", en: "The ultimate piece — hand-woven gold threads, unique series of 1.", es: "La pieza definitiva — hilos dorados tejidos a mano.", de: "Das ultimative Stück — handgewebte Goldfäden." } }),
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connecté à MongoDB. Suppression des anciens produits...");
  await Product.deleteMany({});
  console.log("Insertion des 15 pièces...");
  await Product.insertMany(products);
  console.log("Terminé : 15 produits insérés.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
