import rateLimit from "express-rate-limit";

// Limite les tentatives de connexion/inscription pour contrer le brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite les soumissions de formulaires (sur-mesure, contact) contre le spam
export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 8,
  message: { error: "Trop de demandes envoyées. Merci de réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite générale sur toute l'API
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
