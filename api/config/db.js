import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ ERROR: No existe la variable MONGO_URI");
    process.exit(1);
  }

  const MAX_RETRIES = 20;
  const RETRY_DELAY = 3000; // 3 segundos

  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      console.log(`🔌 Intento ${i}: Conectando a MongoDB...`);

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log("🟢 MongoDB conectado correctamente ✔");
      return;

    } catch (error) {
      console.error(
        `❌ Error conectando a Mongo (intento ${i}): ${error.message}`
      );

      if (i === MAX_RETRIES) {
        console.error("⚠️ No se pudo conectar a MongoDB después de varios intentos");
        process.exit(1);
      }

      // Espera antes del próximo intento
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
    }
  }
}
