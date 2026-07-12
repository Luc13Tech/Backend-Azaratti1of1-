import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

// ✅ SERVIRE LES IMAGES STATIQUES
app.use('/images', express.static(path.join(__dirname, 'public/images')));

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
    { id: "noir",     hex: "#161412", label: { fr: "Noir",       en: "Black",    es: "Negro",       de: "Schwarz"    } },
    { id: "marine",   hex: "#1c2438", label: { fr: "Bleu Marine",en: "Navy",     es: "Azul marino", de: "Marineblau" } },
    { id: "bordeaux", hex: "#5c1626", label: { fr: "Bordeaux",   en: "Burgundy", es: "Burdeos",     de: "Bordeaux"   } },
    { id: "gris",     hex: "#4a4a4a", label: { fr: "Gris",       en: "Gray",     es: "Gris",        de: "Grau"       } },
    { id: "beige",    hex: "#d4c5a0", label: { fr: "Beige",      en: "Beige",    es: "Beige",       de: "Beige"      } },
    { id: "blanc",    hex: "#f5f0e8", label: { fr: "Blanc",      en: "White",    es: "Blanco",      de: "Weiß"       } },
    { id: "bleu",     hex: "#1e3a5f", label: { fr: "Bleu",       en: "Blue",     es: "Azul",        de: "Blau"       } },
    { id: "vert",     hex: "#1e4d3a", label: { fr: "Vert",       en: "Green",    es: "Verde",       de: "Grün"       } },
    { id: "marron",   hex: "#5c3a1e", label: { fr: "Marron",     en: "Brown",    es: "Marrón",      de: "Braun"      } },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Sur mesure"];

  const makeProduct = (n, opts) => {
    const num = String(n).padStart(2, "0");
    return {
      productId: `product-${n}`,
      sku: `AZR-${num}`,
      images: [
        `/images/produits/main-${n}.jpg`,
      ],
      colors: opts.colors || defaultColors.slice(0, 3),
      sizes: sizes,
      category: opts.category || "vestes",
      priceUSD: 450,
      priceEUR: 450,
      name: opts.name,
      description: opts.description,
    };
  };

  const products = [
    // Articles 1 à 15 (existants - corrigés)
    makeProduct(1, {
      category: "vestes",
      name: { fr:"Veste Aza Noire Sculptée", en:"Aza Sculpted Black Jacket", es:"Chaqueta Aza Negra Esculpida", de:"Aza Skulptierte Schwarze Jacke" },
      description: { fr:"Pièce unique taillée à la main, structure sculpturale et finitions soignées. Tissu premium, coupe contemporaine.", en:"Hand-tailored one-off piece with sculptural structure and refined finishes. Premium fabric, contemporary cut.", es:"Pieza única confeccionada a mano, estructura escultural y acabados refinados. Tela premium, corte contemporáneo.", de:"Handgefertigtes Einzelstück mit skulpturaler Struktur und raffinierten Verarbeitungen. Premiumstoff, zeitgenössischer Schnitt." },
    }),
    makeProduct(2, {
      category: "vestes",
      name: { fr:"Veste Ratti Bordeaux Royale", en:"Ratti Royal Burgundy Jacket", es:"Chaqueta Ratti Burdeos Real", de:"Ratti Königliche Bordeauxjacke" },
      description: { fr:"Bordeaux profond, col cranté large, doublure en soie signée AzaRatti. Pièce d'exception pour les connaisseurs.", en:"Deep burgundy, wide notched lapel, silk lining signed AzaRatti. Exceptional piece for connoisseurs.", es:"Burdeos profundo, solapa ancha, forro de seda firmado AzaRatti. Pieza excepcional para conocedores.", de:"Tiefes Bordeaux, breites Revers, Seidenfutter mit AzaRatti-Signatur. Außergewöhnliches Stück für Kenner." },
    }),
    makeProduct(3, {
      category: "smoking",
      name: { fr:"Smoking Édition Azaratti", en:"Azaratti Edition Tuxedo", es:"Esmoquin Edición Azaratti", de:"Azaratti Edition Smoking" },
      description: { fr:"Smoking croisé en laine vierge, revers satin, conçu pour une seule silhouette. Élégance intemporelle.", en:"Double-breasted virgin wool tuxedo, satin lapel, designed for a single silhouette. Timeless elegance.", es:"Esmoquin cruzado de lana virgen, solapa de satén, diseñado para una única silueta. Elegancia atemporal.", de:"Zweireihiger Smoking aus Schurwolle, Satinrevers, für eine einzige Silhouette entworfen. Zeitlose Eleganz." },
    }),
    makeProduct(4, {
      category: "tweed",
      name: { fr:"Veste Tweed Ndoye", en:"Ndoye Tweed Jacket", es:"Chaqueta Tweed Ndoye", de:"Ndoye Tweedjacke" },
      description: { fr:"Tweed chiné tissé à la main, boutons corne véritable, esprit héritage revisité. Authenticité et caractère.", en:"Hand-woven mottled tweed, genuine horn buttons, revisited heritage spirit. Authenticity and character.", es:"Tweed jaspeado tejido a mano, botones de cuerno genuino, espíritu heritage revisitado. Autenticidad y carácter.", de:"Handgewebter melierter Tweed, echte Hornknöpfe, überarbeiteter Heritage-Geist. Authentizität und Charakter." },
    }),
    makeProduct(5, {
      category: "vestes",
      name: { fr:"Veste Azaratti Onyx", en:"Azaratti Onyx Jacket", es:"Chaqueta Azaratti Ónix", de:"Azaratti Onyx Jacke" },
      description: { fr:"Noir profond texturé, ligne épurée, pièce signature de la maison. Minimalisme et sophistication.", en:"Deep textured black, clean line, signature piece of the house. Minimalism and sophistication.", es:"Negro profundo texturizado, línea depurada, pieza insignia de la casa. Minimalismo y sofisticación.", de:"Tiefes strukturiertes Schwarz, klare Linie, Signature-Stück des Hauses. Minimalismus und Raffinesse." },
    }),
    makeProduct(6, {
      category: "vestes",
      name: { fr:"Veste Croisée Lagune", en:"Lagoon Double-Breasted Jacket", es:"Chaqueta Cruzada Laguna", de:"Lagune Zweireiherjacke" },
      description: { fr:"Bleu lagune profond, coupe croisée, boutons dorés gravés. Une pièce qui capte la lumière.", en:"Deep lagoon blue, double-breasted, engraved gold buttons. A piece that captures light.", es:"Azul laguna profundo, corte cruzado, botones dorados grabados. Una pieza que captura la luz.", de:"Tiefes Lagunenblau, zweireihiger Schnitt, gravierte Goldknöpfe. Ein Stück, das Licht einfängt." },
    }),
    makeProduct(7, {
      category: "smoking",
      name: { fr:"Veste Smoking Velours", en:"Velvet Tuxedo Jacket", es:"Chaqueta Esmoquin de Terciopelo", de:"Samt-Smokingjacke" },
      description: { fr:"Velours profond, col châle satin, pour les soirées d'exception. Luxe et raffinement absolus.", en:"Deep velvet, satin shawl collar, for exceptional evenings. Absolute luxury and refinement.", es:"Terciopelo profundo, cuello chal de satén, para veladas excepcionales. Lujo y refinamiento absolutos.", de:"Tiefer Samt, Satin-Schalkragen, für außergewöhnliche Abende. Absoluter Luxus und Raffinement." },
    }),
    makeProduct(8, {
      category: "tweed",
      name: { fr:"Veste Tweed Héritage", en:"Heritage Tweed Jacket", es:"Chaqueta Tweed Herencia", de:"Heritage Tweedjacke" },
      description: { fr:"Motif chevrons, coupe ajustée, façonnée à la main pièce par pièce. Un clin d'œil aux classiques.", en:"Herringbone pattern, fitted cut, hand-shaped piece by piece. A nod to the classics.", es:"Motivo de espiga, corte ajustado, moldeada a mano pieza por pieza. Un guiño a los clásicos.", de:"Fischgrätmuster, schmaler Schnitt, Stück für Stück handgeformt. Eine Hommage an die Klassiker." },
    }),
    makeProduct(9, {
      category: "vestes",
      name: { fr:"Veste Azaratti Ivoire", en:"Azaratti Ivory Jacket", es:"Chaqueta Azaratti Marfil", de:"Azaratti Elfenbein Jacke" },
      description: { fr:"Ivoire texturé rare, doublure brodée du monogramme AzaRatti. Une pièce de collection.", en:"Rare textured ivory, monogram-embroidered lining. A collector's piece.", es:"Marfil texturizado raro, forro bordado con el monograma AzaRatti. Una pieza de colección.", de:"Seltenes strukturiertes Elfenbein, besticktes Futter mit AzaRatti-Monogramm. Ein Sammlerstück." },
    }),
    makeProduct(10, {
      category: "vestes",
      name: { fr:"Veste Graphique Sahel", en:"Sahel Graphic Jacket", es:"Chaqueta Gráfica Sahel", de:"Sahel Grafikjacke" },
      description: { fr:"Motifs graphiques inspirés du Sahel, coupe contemporaine. Un dialogue entre tradition et modernité.", en:"Graphic patterns inspired by the Sahel, contemporary cut. A dialogue between tradition and modernity.", es:"Patrones gráficos inspirados en el Sahel, corte contemporáneo. Un diálogo entre tradición y modernidad.", de:"Grafische Muster inspiriert vom Sahel, zeitgenössischer Schnitt. Ein Dialog zwischen Tradition und Moderne." },
    }),
    makeProduct(11, {
      category: "smoking",
      name: { fr:"Smoking Minuit", en:"Midnight Tuxedo", es:"Esmoquin Medianoche", de:"Mitternachts-Smoking" },
      description: { fr:"Noir absolu, revers pointu satin, la pièce des grandes occasions. Élégance suprême.", en:"Absolute black, satin peak lapel, the piece for grand occasions. Supreme elegance.", es:"Negro absoluto, solapa de pico de satén, la pieza para grandes ocasiones. Elegancia suprema.", de:"Absolutes Schwarz, spitzes Satinrevers, das Stück für große Anlässe. Höchste Eleganz." },
    }),
    makeProduct(12, {
      category: "tweed",
      name: { fr:"Veste Tweed Caramel", en:"Caramel Tweed Jacket", es:"Chaqueta Tweed Caramelo", de:"Karamell Tweedjacke" },
      description: { fr:"Tons chauds, texture riche, poches plaquées façonnées main. Chaleur et authenticité.", en:"Warm tones, rich texture, hand-shaped patch pockets. Warmth and authenticity.", es:"Tonos cálidos, textura rica, bolsillos de parche moldeados a mano. Calidez y autenticidad.", de:"Warme Töne, reiche Textur, handgeformte Pattentaschen. Wärme und Authentizität." },
    }),
    makeProduct(13, {
      category: "vestes",
      name: { fr:"Veste Azaratti Emeraude", en:"Azaratti Emerald Jacket", es:"Chaqueta Azaratti Esmeralda", de:"Azaratti Smaragdjacke" },
      description: { fr:"Vert émeraude profond, col officier brodé, pièce d'exception. Un joyau rare.", en:"Deep emerald green, embroidered officer collar, exceptional piece. A rare jewel.", es:"Verde esmeralda profundo, cuello oficial bordado, pieza excepcional. Una joya rara.", de:"Tiefes Smaragdgrün, bestickter Stehkragen, außergewöhnliches Stück. Ein seltenes Juwel." },
    }),
    makeProduct(14, {
      category: "vestes",
      name: { fr:"Veste Croisée Anthracite", en:"Anthracite Double-Breasted Jacket", es:"Chaqueta Cruzada Antracita", de:"Anthrazit Zweireiherjacke" },
      description: { fr:"Anthracite chiné, ligne stricte, boutonnage croisé signature. Une pièce de caractère.", en:"Mottled anthracite, sharp line, signature double-breasted. A piece with character.", es:"Antracita jaspeado, línea estricta, cruzado insignia. Una pieza con carácter.", de:"Meliertes Anthrazit, strenge Linie, Signature-Zweireiher. Ein Stück mit Charakter." },
    }),
    makeProduct(15, {
      category: "vestes",
      name: { fr:"Veste Azaratti Or Antique", en:"Azaratti Antique Gold Jacket", es:"Chaqueta Azaratti Oro Antiguo", de:"Azaratti Antikgold Jacke" },
      description: { fr:"La pièce ultime — fils dorés tissés à la main, série unique close à 1 exemplaire. L'apogée du savoir-faire.", en:"The ultimate piece — hand-woven gold threads, unique series of 1. The pinnacle of craftsmanship.", es:"La pieza definitiva — hilos dorados tejidos a mano, serie única de 1 ejemplar. La cumbre del savoir-faire.", de:"Das ultimative Stück — handgewebte Goldfäden, einzigartige Serie von 1. Der Gipfel der Handwerkskunst." },
    }),
    
    // Articles 16 à 30 (NOUVEAUX)
    makeProduct(16, {
      category: "vestes",
      name: { fr:"Veste Bleu Royal", en:"Royal Blue Jacket", es:"Chaqueta Azul Real", de:"Königsblaue Jacke" },
      description: { fr:"Bleu royal intense, coupe structurée, boutons nacrés. Une pièce majestueuse.", en:"Intense royal blue, structured cut, mother-of-pearl buttons. A majestic piece.", es:"Azul real intenso, corte estructurado, botones de nácar. Una pieza majestuosa.", de:"Intensives Königsblau, strukturierter Schnitt, Perlmuttknöpfe. Ein majestätisches Stück." },
    }),
    makeProduct(17, {
      category: "tweed",
      name: { fr:"Veste Tweed Écossais", en:"Scottish Tweed Jacket", es:"Chaqueta Tweed Escocés", de:"Schottische Tweedjacke" },
      description: { fr:"Tweed authentique d'Écosse, motif pied-de-poule, finitions cuir aux coudes.", en:"Authentic Scottish tweed, houndstooth pattern, leather elbow patches.", es:"Tweed auténtico de Escocia, patrón de pata de gallo, parches de cuero en codos.", de:"Authentischer schottischer Tweed, Hahnentrittmuster, Leder-Ellenbogenpatches." },
    }),
    makeProduct(18, {
      category: "smoking",
      name: { fr:"Smoking Ciel", en:"Sky Tuxedo", es:"Esmoquin Cielo", de:"Himmelblauer Smoking" },
      description: { fr:"Bleu ciel profond, revers de satin noir, une alternative audacieuse au smoking classique.", en:"Deep sky blue, black satin lapel, a bold alternative to the classic tuxedo.", es:"Azul cielo profundo, solapa de satén negro, una alternativa audaz al esmoquin clásico.", de:"Tiefes Himmelblau, schwarzes Satinrevers, eine mutige Alternative zum klassischen Smoking." },
    }),
    makeProduct(19, {
      category: "vestes",
      name: { fr:"Veste Azaratti Miel", en:"Azaratti Honey Jacket", es:"Chaqueta Azaratti Miel", de:"Azaratti Honigjacke" },
      description: { fr:"Ton miel chaud, tissu texturé, coupe mi-ajustée. Douceur et élégance.", en:"Warm honey tone, textured fabric, semi-fitted cut. Softness and elegance.", es:"Tono miel cálido, tela texturizada, corte semi-ajustado. Suavidad y elegancia.", de:"Warmer Honigton, strukturierter Stoff, halbtaillierter Schnitt. Sanftheit und Eleganz." },
    }),
    makeProduct(20, {
      category: "tweed",
      name: { fr:"Veste Tweed Automne", en:"Autumn Tweed Jacket", es:"Chaqueta Tweed Otoño", de:"Herbstliche Tweedjacke" },
      description: { fr:"Mélange de bruns et d'ocres, évoquant les feuilles d'automne. Chaleur et caractère.", en:"Blend of browns and ochres, evoking autumn leaves. Warmth and character.", es:"Mezcla de marrones y ocres, evocando las hojas de otoño. Calidez y carácter.", de:"Mischung aus Brauntönen und Ocker, Herbstblätter evozierend. Wärme und Charakter." },
    }),
    makeProduct(21, {
      category: "vestes",
      name: { fr:"Veste Croisée Marine", en:"Navy Double-Breasted Jacket", es:"Chaqueta Cruzada Azul Marino", de:"Marineblaue Zweireiherjacke" },
      description: { fr:"Bleu marine profond, boutons dorés, col cranté. L'élégance navale revisité.", en:"Deep navy, gold buttons, notched lapel. Naval elegance revisited.", es:"Azul marino profundo, botones dorados, solapa con muesca. Elegancia naval revisitada.", de:"Tiefes Marineblau, Goldknöpfe, gekerbtes Revers. Marine-Eleganz neu interpretiert." },
    }),
    makeProduct(22, {
      category: "smoking",
      name: { fr:"Smoking Opéra", en:"Opera Tuxedo", es:"Esmoquin Ópera", de:"Opern-Smoking" },
      description: { fr:"Smoking queue-de-pie, revers satin, pour les soirées les plus prestigieuses.", en:"Tailcoat tuxedo, satin lapel, for the most prestigious evenings.", es:"Esmoquin de frac, solapa de satén, para las veladas más prestigiosas.", de:"Frack-Smoking, Satinrevers, für die prestigeträchtigsten Abende." },
    }),
    makeProduct(23, {
      category: "vestes",
      name: { fr:"Veste Azaratti Terracotta", en:"Azaratti Terracotta Jacket", es:"Chaqueta Azaratti Terracota", de:"Azaratti Terrakottajacke" },
      description: { fr:"Terracotta profond, matière naturelle, coupe décontractée chic. Un hommage à la terre.", en:"Deep terracotta, natural material, relaxed chic cut. A tribute to the earth.", es:"Terracota profundo, material natural, corte chic relajado. Un homenaje a la tierra.", de:"Tiefes Terrakotta, natürliches Material, lässig-eleganter Schnitt. Eine Hommage an die Erde." },
    }),
    makeProduct(24, {
      category: "tweed",
      name: { fr:"Veste Tweed Aran", en:"Aran Tweed Jacket", es:"Chaqueta Tweed Aran", de:"Aran Tweedjacke" },
      description: { fr:"Ispiré des pulls irlandais Aran, tissu texturé et motifs torsadés. Authenticité celtique.", en:"Inspired by Aran Irish sweaters, textured fabric and cable patterns. Celtic authenticity.", es:"Inspirado en los jerséis irlandeses Aran, tela texturizada y patrones de cable. Autenticidad celta.", de:"Inspiriert von irischen Aran-Pullovern, strukturierter Stoff und Zopfmuster. Keltische Authentizität." },
    }),
    makeProduct(25, {
      category: "vestes",
      name: { fr:"Veste Azaratti Pétrole", en:"Azaratti Petroleum Jacket", es:"Chaqueta Azaratti Petróleo", de:"Azaratti Petroljacke" },
      description: { fr:"Vert pétrole profond, doublure soie, col officier. Une pièce sophistiquée.", en:"Deep petroleum green, silk lining, officer collar. A sophisticated piece.", es:"Verde petróleo profundo, forro de seda, cuello oficial. Una pieza sofisticada.", de:"Tiefes Petrolgrün, Seidenfutter, Stehkragen. Ein raffiniertes Stück." },
    }),
    makeProduct(26, {
      category: "smoking",
      name: { fr:"Smoking Impérial", en:"Imperial Tuxedo", es:"Esmoquin Imperial", de:"Imperialer Smoking" },
      description: { fr:"Smoking avec broderies dorées, revers en soie, inspiré des uniformes impériaux. Une pièce royale.", en:"Tuxedo with gold embroidery, silk lapel, inspired by imperial uniforms. A royal piece.", es:"Esmoquin con bordados dorados, solapa de seda, inspirado en uniformes imperiales. Una pieza real.", de:"Smoking mit Goldstickerei, Seidenrevers, inspiriert von imperialen Uniformen. Ein königliches Stück." },
    }),
    makeProduct(27, {
      category: "vestes",
      name: { fr:"Veste Azaratti Sable", en:"Azaratti Sand Jacket", es:"Chaqueta Azaratti Arena", de:"Azaratti Sandjacke" },
      description: { fr:"Beige sableux, coupe décontractée, poches plaquées. Un classique réinventé.", en:"Sandy beige, relaxed cut, patch pockets. A reinvented classic.", es:"Beige arenoso, corte relajado, bolsillos de parche. Un clásico reinventado.", de:"Sandiges Beige, lässiger Schnitt, Pattentaschen. Ein neu erfundener Klassiker." },
    }),
    makeProduct(28, {
      category: "tweed",
      name: { fr:"Veste Tweed des Highlands", en:"Highlands Tweed Jacket", es:"Chaqueta Tweed de las Tierras Altas", de:"Highlands Tweedjacke" },
      description: { fr:"Tweed épais des Highlands, motif traditionnel, doublure en tartan. Un voyage en Écosse.", en:"Thick Highlands tweed, traditional pattern, tartan lining. A journey to Scotland.", es:"Tweed grueso de las Tierras Altas, patrón tradicional, forro de tartán. Un viaje a Escocia.", de:"Dickes Highlands-Tweed, traditionelles Muster, Tartan-Futter. Eine Reise nach Schottland." },
    }),
    makeProduct(29, {
      category: "vestes",
      name: { fr:"Veste Azaratti Ambre", en:"Azaratti Amber Jacket", es:"Chaqueta Azaratti Ámbar", de:"Azaratti Bernsteinjacke" },
      description: { fr:"Ambre chaud, matière fluide, coupe contemporaine. Une pièce lumineuse.", en:"Warm amber, fluid material, contemporary cut. A luminous piece.", es:"Ámbar cálido, material fluido, corte contemporáneo. Una pieza luminosa.", de:"Warmer Bernstein, fließendes Material, zeitgenössischer Schnitt. Ein leuchtendes Stück." },
    }),
    makeProduct(30, {
      category: "smoking",
      name: { fr:"Smoking Cobalt", en:"Cobalt Tuxedo", es:"Esmoquin Cobalto", de:"Kobaltblauer Smoking" },
      description: { fr:"Bleu cobalt intense, revers satin noir, une pièce qui attire tous les regards.", en:"Intense cobalt blue, black satin lapel, a piece that draws all eyes.", es:"Azul cobalto intenso, solapa de satén negro, una pieza que atrae todas las miradas.", de:"Intensives Kobaltblau, schwarzes Satinrevers, ein Stück, das alle Blicke auf sich zieht." },
    }),
    
    // Articles 31 à 45 (NOUVEAUX)
    makeProduct(31, {
      category: "vestes",
      name: { fr:"Veste Azaratti Sauge", en:"Azaratti Sage Jacket", es:"Chaqueta Azaratti Salvia", de:"Azaratti Salbeijacke" },
      description: { fr:"Vert sauge doux, coupe décontractée, détails minimalistes. Fraîcheur et élégance.", en:"Soft sage green, relaxed cut, minimalist details. Freshness and elegance.", es:"Verde salvia suave, corte relajado, detalles minimalistas. Frescura y elegancia.", de:"Weiches Salbeigrün, lässiger Schnitt, minimalistische Details. Frische und Eleganz." },
    }),
    makeProduct(32, {
      category: "tweed",
      name: { fr:"Veste Tweed Champagne", en:"Champagne Tweed Jacket", es:"Chaqueta Tweed Champaña", de:"Champagner Tweedjacke" },
      description: { fr:"Beige champagne, fils dorés subtils, texture légère. Une pièce pétillante.", en:"Champagne beige, subtle gold threads, light texture. A sparkling piece.", es:"Beige champaña, hilos dorados sutiles, textura ligera. Una pieza chispeante.", de:"Champagnerbeige, dezente Goldfäden, leichte Textur. Ein prickelndes Stück." },
    }),
    makeProduct(33, {
      category: "vestes",
      name: { fr:"Veste Croisée Prune", en:"Plum Double-Breasted Jacket", es:"Chaqueta Cruzada Ciruela", de:"Pflaumen-Zweireiherjacke" },
      description: { fr:"Prune profonde, boutons argentés, coupe structurée. Une pièce audacieuse.", en:"Deep plum, silver buttons, structured cut. A bold piece.", es:"Ciruela profunda, botones plateados, corte estructurado. Una pieza audaz.", de:"Tiefe Pflaume, silberne Knöpfe, strukturierter Schnitt. Ein kühnes Stück." },
    }),
    makeProduct(34, {
      category: "smoking",
      name: { fr:"Smoking de Gala", en:"Gala Tuxedo", es:"Esmoquin de Gala", de:"Gala-Smoking" },
      description: { fr:"Smoking avec jabot, revers en velours, pour les occasions les plus prestigieuses.", en:"Tuxedo with jabot, velvet lapel, for the most prestigious occasions.", es:"Esmoquin con chorrera, solapa de terciopelo, para las ocasiones más prestigiosas.", de:"Smoking mit Jabot, Samtrevers, für die prestigeträchtigsten Anlässe." },
    }),
    makeProduct(35, {
      category: "vestes",
      name: { fr:"Veste Azaratti Nuit", en:"Azaratti Night Jacket", es:"Chaqueta Azaratti Noche", de:"Azaratti Nachtjacke" },
      description: { fr:"Noir profond, détails brillants subtils, coupe élancée. L'élégance de la nuit.", en:"Deep black, subtle shiny details, slim cut. The elegance of the night.", es:"Negro profundo, detalles brillantes sutiles, corte estilizado. La elegancia de la noche.", de:"Tiefes Schwarz, dezente glänzende Details, schmaler Schnitt. Die Eleganz der Nacht." },
    }),
    makeProduct(36, {
      category: "tweed",
      name: { fr:"Veste Tweed Bruyère", en:"Heather Tweed Jacket", es:"Chaqueta Tweed Brezo", de:"Heidekraut-Tweedjacke" },
      description: { fr:"Mélange de pourpres et de mauves, évoquant la bruyère en fleur. Poésie et élégance.", en:"Blend of purples and mauves, evoking heather in bloom. Poetry and elegance.", es:"Mezcla de púrpuras y malvas, evocando el brezo en flor. Poesía y elegancia.", de:"Mischung aus Purpur- und Malvenfarben, blühende Heide evozierend. Poesie und Eleganz." },
    }),
    makeProduct(37, {
      category: "vestes",
      name: { fr:"Veste Azaratti Glacier", en:"Azaratti Glacier Jacket", es:"Chaqueta Azaratti Glaciar", de:"Azaratti Gletscherjacke" },
      description: { fr:"Bleu glacier pâle, tissu texturé, coupe moderne. Fraîcheur et luminosité.", en:"Pale glacier blue, textured fabric, modern cut. Freshness and brightness.", es:"Azul glaciar pálido, tela texturizada, corte moderno. Frescura y luminosidad.", de:"Helles Gletscherblau, strukturierter Stoff, moderner Schnitt. Frische und Helligkeit." },
    }),
    makeProduct(38, {
      category: "smoking",
      name: { fr:"Smoking Rouge", en:"Red Tuxedo", es:"Esmoquin Rojo", de:"Roter Smoking" },
      description: { fr:"Rouge profond et audacieux, revers satin noir. Une déclaration de style.", en:"Deep and bold red, black satin lapel. A style statement.", es:"Rojo profundo y audaz, solapa de satén negro. Una declaración de estilo.", de:"Tiefes und kühnes Rot, schwarzes Satinrevers. Ein Stil-Statement." },
    }),
    makeProduct(39, {
      category: "vestes",
      name: { fr:"Veste Azaratti Paille", en:"Azaratti Straw Jacket", es:"Chaqueta Azaratti Paja", de:"Azaratti Strohjacke" },
      description: { fr:"Beige paille, matière naturelle, coupe estivale. Une pièce légère et chic.", en:"Straw beige, natural material, summer cut. A light and chic piece.", es:"Beige paja, material natural, corte veraniego. Una pieza ligera y chic.", de:"Strohbeige, natürliches Material, sommerlicher Schnitt. Ein leichtes und schickes Stück." },
    }),
    makeProduct(40, {
      category: "tweed",
      name: { fr:"Veste Tweed Forêt", en:"Forest Tweed Jacket", es:"Chaqueta Tweed Bosque", de:"Wald-Tweedjacke" },
      description: { fr:"Verts profonds de la forêt, texture épaisse, doublure en soie. Un hommage à la nature.", en:"Deep forest greens, thick texture, silk lining. A tribute to nature.", es:"Verdes profundos del bosque, textura gruesa, forro de seda. Un homenaje a la naturaleza.", de:"Tiefe Waldgrüntöne, dicke Textur, Seidenfutter. Eine Hommage an die Natur." },
    }),
    makeProduct(41, {
      category: "vestes",
      name: { fr:"Veste Azaratti Corail", en:"Azaratti Coral Jacket", es:"Chaqueta Azaratti Coral", de:"Azaratti Korallenjacke" },
      description: { fr:"Corail tendre, coupe décontractée, détails en nacre. Une pièce inspirée de l'océan.", en:"Soft coral, relaxed cut, mother-of-pearl details. A piece inspired by the ocean.", es:"Coral suave, corte relajado, detalles de nácar. Una pieza inspirada en el océano.", de:"Weiches Korallenrot, lässiger Schnitt, Perlmutt-Details. Ein vom Ozean inspiriertes Stück." },
    }),
    makeProduct(42, {
      category: "smoking",
      name: { fr:"Smoking Ciel d'Hiver", en:"Winter Sky Tuxedo", es:"Esmoquin Cielo Invernal", de:"Wintersky-Smoking" },
      description: { fr:"Bleu ciel hivernal, revers blanc ivoire. Une fraîcheur glaciale et élégante.", en:"Winter sky blue, ivory white lapel. A cool and elegant freshness.", es:"Azul cielo invernal, solapa blanco marfil. Una frescura glacial y elegante.", de:"Winterliches Himmelblau, elfenbeinweißes Revers. Eine kühle und elegante Frische." },
    }),
    makeProduct(43, {
      category: "vestes",
      name: { fr:"Veste Azaratti Bronze", en:"Azaratti Bronze Jacket", es:"Chaqueta Azaratti Bronce", de:"Azaratti Bronzejacke" },
      description: { fr:"Bronze chaud, tissu métallisé, coupe structurée. Une pièce au caractère antique.", en:"Warm bronze, metallic fabric, structured cut. A piece with ancient character.", es:"Bronce cálido, tela metalizada, corte estructurado. Una pieza con carácter antiguo.", de:"Warmer Bronze, metallischer Stoff, strukturierter Schnitt. Ein Stück mit antikem Charakter." },
    }),
    makeProduct(44, {
      category: "tweed",
      name: { fr:"Veste Tweed Caban", en:"Caban Tweed Jacket", es:"Chaqueta Tweed Caban", de:"Caban-Tweedjacke" },
      description: { fr:"Tweed épais façon caban, col large, boutons en bois. Un intemporel réinventé.", en:"Thick caban-style tweed, wide collar, wooden buttons. A reinvented timeless piece.", es:"Tweed grueso estilo cabán, cuello ancho, botones de madera. Un atemporal reinventado.", de:"Dicker Tweed im Caban-Stil, weiter Kragen, Holzknöpfe. Ein neu erfundener Klassiker." },
    }),
    makeProduct(45, {
      category: "vestes",
      name: { fr:"Veste Azaratti Orchidée", en:"Azaratti Orchid Jacket", es:"Chaqueta Azaratti Orquídea", de:"Azaratti Orchideenjacke" },
      description: { fr:"Violet orchidée, doublure en soie imprimée, coupe élancée. Une pièce florale et élégante.", en:"Orchid purple, printed silk lining, slim cut. A floral and elegant piece.", es:"Púrpura orquídea, forro de seda estampado, corte estilizado. Una pieza floral y elegante.", de:"Orchideenviolett, bedrucktes Seidenfutter, schmaler Schnitt. Ein florales und elegantes Stück." },
    }),
    
    // Articles 46 à 60 (NOUVEAUX)
    makeProduct(46, {
      category: "smoking",
      name: { fr:"Smoking Améthyste", en:"Amethyst Tuxedo", es:"Esmoquin Amatista", de:"Amethyst-Smoking" },
      description: { fr:"Violet améthyste profond, revers satin, une pièce aux reflets précieux.", en:"Deep amethyst purple, satin lapel, a piece with precious reflections.", es:"Púrpura amatista profundo, solapa de satén, una pieza con reflejos preciosos.", de:"Tiefes Amethystviolett, Satinrevers, ein Stück mit kostbaren Reflexen." },
    }),
    makeProduct(47, {
      category: "vestes",
      name: { fr:"Veste Azaratti Mousseline", en:"Azaratti Muslin Jacket", es:"Chaqueta Azaratti Muselina", de:"Azaratti Mousselinejacke" },
      description: { fr:"Beige mousseline, tissu léger, coupe fluide. Une pièce aérienne et raffinée.", en:"Muslin beige, light fabric, fluid cut. An airy and refined piece.", es:"Beige muselina, tela ligera, corte fluido. Una pieza aérea y refinada.", de:"Mousselinebeige, leichter Stoff, fließender Schnitt. Ein luftiges und raffiniertes Stück." },
    }),
    makeProduct(48, {
      category: "tweed",
      name: { fr:"Veste Tweed Mûre", en:"Blackberry Tweed Jacket", es:"Chaqueta Tweed Mora", de:"Brombeer-Tweedjacke" },
      description: { fr:"Violet mûre, texture riche, boutons corne. Une pièce gourmande et élégante.", en:"Blackberry purple, rich texture, horn buttons. A rich and elegant piece.", es:"Púrpura mora, textura rica, botones de cuerno. Una pieza rica y elegante.", de:"Brombeerviolett, reiche Textur, Hornknöpfe. Ein üppiges und elegantes Stück." },
    }),
    makeProduct(49, {
      category: "vestes",
      name: { fr:"Veste Azaratti Aurore", en:"Azaratti Aurora Jacket", es:"Chaqueta Azaratti Aurora", de:"Azaratti Aurorajacke" },
      description: { fr:"Rose aurore, détails brillants, coupe moderne. Une pièce lumineuse et inspirante.", en:"Aurora pink, shiny details, modern cut. A bright and inspiring piece.", es:"Rosa aurora, detalles brillantes, corte moderno. Una pieza luminosa e inspiradora.", de:"Aurorarosa, glänzende Details, moderner Schnitt. Ein helles und inspirierendes Stück." },
    }),
    makeProduct(50, {
      category: "smoking",
      name: { fr:"Smoking Ébène", en:"Ebony Tuxedo", es:"Esmoquin Ébano", de:"Ebenholz-Smoking" },
      description: { fr:"Noir ébène, revers en satin, coupe ultra-structurée. La quintessence de l'élégance.", en:"Ebony black, satin lapel, ultra-structured cut. The quintessence of elegance.", es:"Negro ébano, solapa de satén, corte ultra-estructurado. La quintaesencia de la elegancia.", de:"Ebenholzschwarz, Satinrevers, ultra-strukturierter Schnitt. Die Quintessenz der Eleganz." },
    }),
    makeProduct(51, {
      category: "vestes",
      name: { fr:"Veste Azaratti Coton", en:"Azaratti Cotton Jacket", es:"Chaqueta Azaratti Algodón", de:"Azaratti Baumwolljacke" },
      description: { fr:"Blanc coton, coupe décontractée, détails en lin. Une pièce naturelle et pure.", en:"Cotton white, relaxed cut, linen details. A natural and pure piece.", es:"Blanco algodón, corte relajado, detalles de lino. Una pieza natural y pura.", de:"Baumwollweiß, lässiger Schnitt, Leinen-Details. Ein natürliches und reines Stück." },
    }),
    makeProduct(52, {
      category: "tweed",
      name: { fr:"Veste Tweed Vanille", en:"Vanilla Tweed Jacket", es:"Chaqueta Tweed Vainilla", de:"Vanille-Tweedjacke" },
      description: { fr:"Beige vanille, texture légère, fils argentés. Une pièce douce et sophistiquée.", en:"Vanilla beige, light texture, silver threads. A soft and sophisticated piece.", es:"Beige vainilla, textura ligera, hilos plateados. Una pieza suave y sofisticada.", de:"Vanillebeige, leichte Textur, silberne Fäden. Ein weiches und raffiniertes Stück." },
    }),
    makeProduct(53, {
      category: "vestes",
      name: { fr:"Veste Azaratti Zéphyr", en:"Azaratti Zephyr Jacket", es:"Chaqueta Azaratti Céfiro", de:"Azaratti Zephyrjacke" },
      description: { fr:"Bleu zéphyr, tissu vaporeux, coupe fluide. Légèreté et élégance.", en:"Zephyr blue, airy fabric, fluid cut. Lightness and elegance.", es:"Azul céfiro, tela vaporosa, corte fluido. Ligereza y elegancia.", de:"Zephyrblau, luftiger Stoff, fließender Schnitt. Leichtigkeit und Eleganz." },
    }),
    makeProduct(54, {
      category: "smoking",
      name: { fr:"Smoking Royal", en:"Royal Tuxedo", es:"Esmoquin Real", de:"Königlicher Smoking" },
      description: { fr:"Pourpre royal, broderies dorées, revers en satin. Une pièce digne d'un monarque.", en:"Royal purple, gold embroidery, satin lapel. A piece fit for a monarch.", es:"Púrpura real, bordados dorados, solapa de satén. Una pieza digna de un monarca.", de:"Königliches Purpur, Goldstickerei, Satinrevers. Ein Stück, eines Monarchen würdig." },
    }),
    makeProduct(55, {
      category: "vestes",
      name: { fr:"Veste Azaratti Argile", en:"Azaratti Clay Jacket", es:"Chaqueta Azaratti Arcilla", de:"Azaratti Tonjacke" },
      description: { fr:"Argile rouge, matière naturelle, coupe authentique. Un retour aux sources.", en:"Red clay, natural material, authentic cut. A return to roots.", es:"Arcilla roja, material natural, corte auténtico. Un regreso a las raíces.", de:"Roter Ton, natürliches Material, authentischer Schnitt. Eine Rückkehr zu den Wurzeln." },
    }),
    makeProduct(56, {
      category: "tweed",
      name: { fr:"Veste Tweed Chêne", en:"Oak Tweed Jacket", es:"Chaqueta Tweed Roble", de:"Eichen-Tweedjacke" },
      description: { fr:"Brun chêne, texture robuste, doublure en velours. Une pièce solide et élégante.", en:"Oak brown, robust texture, velvet lining. A solid and elegant piece.", es:"Marrón roble, textura robusta, forro de terciopelo. Una pieza sólida y elegante.", de:"Eichenbraun, robuste Textur, Samtfutter. Ein solides und elegantes Stück." },
    }),
    makeProduct(57, {
      category: "vestes",
      name: { fr:"Veste Azaratti Perle", en:"Azaratti Pearl Jacket", es:"Chaqueta Azaratti Perla", de:"Azaratti Perlenjacke" },
      description: { fr:"Blanc perle, détails nacrés, coupe raffinée. Une pièce précieuse et lumineuse.", en:"Pearl white, mother-of-pearl details, refined cut. A precious and luminous piece.", es:"Blanco perla, detalles de nácar, corte refinado. Una pieza preciosa y luminosa.", de:"Perlweiß, Perlmutt-Details, raffinierter Schnitt. Ein kostbares und leuchtendes Stück." },
    }),
    makeProduct(58, {
      category: "smoking",
      name: { fr:"Smoking Toundra", en:"Tundra Tuxedo", es:"Esmoquin Tundra", de:"Tundra-Smoking" },
      description: { fr:"Gris toundra, revers en laine, coupe confortable. Une élégance nordique.", en:"Tundra gray, wool lapel, comfortable cut. A Nordic elegance.", es:"Gris tundra, solapa de lana, corte cómodo. Una elegancia nórdica.", de:"Tundragrau, Wollrevers, bequemer Schnitt. Eine nordische Eleganz." },
    }),
    makeProduct(59, {
      category: "vestes",
      name: { fr:"Veste Azaratti Abysse", en:"Azaratti Abyss Jacket", es:"Chaqueta Azaratti Abismo", de:"Azaratti Abyssjacke" },
      description: { fr:"Bleu abyssal, doublure en soie, coupe profonde. Une plongée dans l'élégance.", en:"Abyssal blue, silk lining, deep cut. A dive into elegance.", es:"Azul abismal, forro de seda, corte profundo. Una inmersión en la elegancia.", de:"Abyssblau, Seidenfutter, tiefer Schnitt. Ein Tauchgang in die Eleganz." },
    }),
    makeProduct(60, {
      category: "tweed",
      name: { fr:"Veste Tweed Châtaigne", en:"Chestnut Tweed Jacket", es:"Chaqueta Tweed Castaña", de:"Kastanien-Tweedjacke" },
      description: { fr:"Brun châtaigne, texture chaleureuse, boutons bois. Une pièce automnale et authentique.", en:"Chestnut brown, warm texture, wooden buttons. An autumnal and authentic piece.", es:"Marrón castaña, textura cálida, botones de madera. Una pieza otoñal y auténtica.", de:"Kastanienbraun, warme Textur, Holzknöpfe. Ein herbstliches und authentisches Stück." },
    }),
    
    // Articles 61 à 73 (NOUVEAUX)
    makeProduct(61, {
      category: "vestes",
      name: { fr:"Veste Azaratti Flamme", en:"Azaratti Flame Jacket", es:"Chaqueta Azaratti Llama", de:"Azaratti Flammenjacke" },
      description: { fr:"Rouge flamme, détails noirs, coupe structurée. Une pièce passionnée et intense.", en:"Flame red, black details, structured cut. A passionate and intense piece.", es:"Rojo llama, detalles negros, corte estructurado. Una pieza apasionada e intensa.", de:"Flammenrot, schwarze Details, strukturierter Schnitt. Ein leidenschaftliches und intensives Stück." },
    }),
    makeProduct(62, {
      category: "smoking",
      name: { fr:"Smoking Glace", en:"Ice Tuxedo", es:"Esmoquin Hielo", de:"Eis-Smoking" },
      description: { fr:"Bleu glacé, revers argenté, coupe épurée. Une fraîcheur élégante.", en:"Ice blue, silver lapel, clean cut. An elegant freshness.", es:"Azul hielo, solapa plateada, corte depurado. Una frescura elegante.", de:"Eisblau, silbernes Revers, klarer Schnitt. Eine elegante Frische." },
    }),
    makeProduct(63, {
      category: "vestes",
      name: { fr:"Veste Azaratti Mirage", en:"Azaratti Mirage Jacket", es:"Chaqueta Azaratti Espejismo", de:"Azaratti Miragejacke" },
      description: { fr:"Beige mirage, tissu texturé, coupe décontractée. Une illusion d'élégance.", en:"Mirage beige, textured fabric, relaxed cut. An illusion of elegance.", es:"Beige espejismo, tela texturizada, corte relajado. Una ilusión de elegancia.", de:"Miragebeige, strukturierter Stoff, lässiger Schnitt. Eine Illusion von Eleganz." },
    }),
    makeProduct(64, {
      category: "tweed",
      name: { fr:"Veste Tweed Noisette", en:"Hazelnut Tweed Jacket", es:"Chaqueta Tweed Avellana", de:"Haselnuss-Tweedjacke" },
      description: { fr:"Brun noisette, texture douce, finitions cuir. Une pièce gourmande et raffinée.", en:"Hazelnut brown, soft texture, leather details. A rich and refined piece.", es:"Marrón avellana, textura suave, acabados en cuero. Una pieza rica y refinada.", de:"Haselnussbraun, weiche Textur, Leder-Details. Ein üppiges und raffiniertes Stück." },
    }),
    makeProduct(65, {
      category: "vestes",
      name: { fr:"Veste Azaratti Orage", en:"Azaratti Storm Jacket", es:"Chaqueta Azaratti Tormenta", de:"Azaratti Sturmjacke" },
      description: { fr:"Gris orage, coupe dynamique, détails contrastés. Une pièce puissante.", en:"Storm gray, dynamic cut, contrasting details. A powerful piece.", es:"Gris tormenta, corte dinámico, detalles contrastados. Una pieza poderosa.", de:"Sturmgrau, dynamischer Schnitt, kontrastierende Details. Ein kraftvolles Stück." },
    }),
    makeProduct(66, {
      category: "smoking",
      name: { fr:"Smoking Mousse", en:"Moss Tuxedo", es:"Esmoquin Musgo", de:"Moss-Smoking" },
      description: { fr:"Vert mousse, revers en velours, coupe organique. Une élégance naturelle.", en:"Moss green, velvet lapel, organic cut. A natural elegance.", es:"Verde musgo, solapa de terciopelo, corte orgánico. Una elegancia natural.", de:"Moosgrün, Samtrevers, organischer Schnitt. Eine natürliche Eleganz." },
    }),
    makeProduct(67, {
      category: "vestes",
      name: { fr:"Veste Azaratti Crépuscule", en:"Azaratti Twilight Jacket", es:"Chaqueta Azaratti Crepúsculo", de:"Azaratti Dämmerungsjacke" },
      description: { fr:"Violet crépuscule, doublure dorée, coupe raffinée. Une pièce poétique.", en:"Twilight purple, gold lining, refined cut. A poetic piece.", es:"Púrpura crepúsculo, forro dorado, corte refinado. Una pieza poética.", de:"Dämmerungsviolett, goldenes Futter, raffinierter Schnitt. Ein poetisches Stück." },
    }),
    makeProduct(68, {
      category: "tweed",
      name: { fr:"Veste Tweed Lune", en:"Moon Tweed Jacket", es:"Chaqueta Tweed Luna", de:"Mond-Tweedjacke" },
      description: { fr:"Gris lunaire, fils argentés, coupe élancée. Une pièce céleste.", en:"Lunar gray, silver threads, slim cut. A celestial piece.", es:"Gris lunar, hilos plateados, corte estilizado. Una pieza celestial.", de:"Mondgrau, silberne Fäden, schmaler Schnitt. Ein himmlisches Stück." },
    }),
    makeProduct(69, {
      category: "vestes",
      name: { fr:"Veste Azaratti Saffron", en:"Azaratti Saffron Jacket", es:"Chaqueta Azaratti Azafrán", de:"Azaratti Safranjacke" },
      description: { fr:"Jaune safran, tissu texturé, coupe contemporaine. Une pièce ensoleillée.", en:"Saffron yellow, textured fabric, contemporary cut. A sunny piece.", es:"Amarillo azafrán, tela texturizada, corte contemporáneo. Una pieza soleada.", de:"Safrangelb, strukturierter Stoff, zeitgenössischer Schnitt. Ein sonniges Stück." },
    }),
    makeProduct(70, {
      category: "smoking",
      name: { fr:"Smoking Obsidienne", en:"Obsidian Tuxedo", es:"Esmoquin Obsidiana", de:"Obsidian-Smoking" },
      description: { fr:"Noir obsidienne, reflets brillants, coupe structurée. Une pièce minérale.", en:"Obsidian black, shiny reflections, structured cut. A mineral piece.", es:"Negro obsidiana, reflejos brillantes, corte estructurado. Una pieza mineral.", de:"Obsidianschwarz, glänzende Reflexe, strukturierter Schnitt. Ein mineralisches Stück." },
    }),
    makeProduct(71, {
      category: "vestes",
      name: { fr:"Veste Azaratti Nacre", en:"Azaratti Mother-of-Pearl Jacket", es:"Chaqueta Azaratti Nácar", de:"Azaratti Perlmuttjacke" },
      description: { fr:"Blanc nacré, détails irisés, coupe raffinée. Une pièce aux reflets changeants.", en:"Mother-of-pearl white, iridescent details, refined cut. A piece with changing reflections.", es:"Blanco nacarado, detalles iridiscentes, corte refinado. Una pieza con reflejos cambiantes.", de:"Perlmuttweiß, schillernde Details, raffinierter Schnitt. Ein Stück mit wechselnden Reflexen." },
    }),
    makeProduct(72, {
      category: "tweed",
      name: { fr:"Veste Tweed Épice", en:"Spice Tweed Jacket", es:"Chaqueta Tweed Especia", de:"Gewürz-Tweedjacke" },
      description: { fr:"Mélange de rouges et d'ocres, texture riche. Une pièce aux accents chauds.", en:"Blend of reds and ochres, rich texture. A piece with warm accents.", es:"Mezcla de rojos y ocres, textura rica. Una pieza con acentos cálidos.", de:"Mischung aus Rottönen und Ocker, reiche Textur. Ein Stück mit warmen Akzenten." },
    }),
    makeProduct(73, {
      category: "vestes",
      name: { fr:"Veste Azaratti Infini", en:"Azaratti Infinity Jacket", es:"Chaqueta Azaratti Infinito", de:"Azaratti Unendlichkeitsjacke" },
      description: { fr:"Noir infini, détails brillants subtils, coupe intemporelle. La pièce ultime de la collection.", en:"Infinite black, subtle shiny details, timeless cut. The ultimate piece of the collection.", es:"Negro infinito, detalles brillantes sutiles, corte atemporal. La pieza definitiva de la colección.", de:"Unendliches Schwarz, dezente glänzende Details, zeitloser Schnitt. Das ultimative Stück der Kollektion." },
    }),
  ];

  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    res.json({ success: true, message: "73 produits insérés avec succès dans MongoDB." });
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
