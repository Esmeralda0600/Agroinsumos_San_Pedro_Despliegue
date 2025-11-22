import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectMongo() {
  const MAX_RETRIES = 20;
  const RETRY_DELAY = 3000; // 3 segundos

  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      console.log(`Intento ${i}: Conectando a MongoDB -> ${process.env.MONGO_URI}`);

      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log("✅ MongoDB conectado correctamente");
      return;

    } catch (error) {
      console.error(`❌ Error conectando a MongoDB (intento ${i}):`, error.message);

      // Si ya agotó intentos → apagar
      if (i === MAX_RETRIES) {
        console.error("❌ No se pudo conectar a Mongo después de varios intentos");
        process.exit(1);
      }

      // esperar antes del siguiente intento
      await new Promise(res => setTimeout(res, RETRY_DELAY));
    }
  }
}