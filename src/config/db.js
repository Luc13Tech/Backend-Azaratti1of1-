import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI manquant dans les variables d'environnement.");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connecté avec succès.");
  } catch (err) {
    console.error("Erreur de connexion MongoDB :", err.message);
    process.exit(1);
  }
}
