import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo } from "./config/db.js";

import agro_spa_routes from "./routes/agro_spa_routes.js";
import agro_spa_routes_admin from "./routes/agro_spa_routes_admin.js";
import producto_routes from "./routes/producto_routes.js";
import favoritoRoutes from "./routes/favoritoRoutes.js";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import pagoRoutes from "./routes/pagoRoutes.js";
import ventaRoutes from "./routes/venta_routes.js";
import geminiRoutes from "./routes/gemini_routes.js";

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// =====================================
// 🔧 Ajustes de archivo y directorio
// =====================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// =============================
// 🎯 CORS CONFIG
// =============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",

  // 🔹 Dominios Vercel que estás usando AHORA
  "https://agroinsumos-san-pedro-despliegue-us-eight.vercel.app",
  "https://agroinsumos-san-pedro-despliegue-sigma.vercel.app",

  // 🔹 Backend Render
  "https://agroinsumos-san-pedro-despliegue.onrender.com",
  "https://agroinsumos-san-pedro-despliegue-kafy.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("🌍 ORIGIN SOLICITANDO:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("⚠️ Origen BLOQUEADO:", origin);
      callback(new Error("CORS bloqueado por seguridad"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// =============================
// 📡 Conexión a Mongo
// =============================
await connectMongo();

// =============================
// 📌 Rutas API
// =============================
app.use("/usuarios", agro_spa_routes);
app.use("/administradores", agro_spa_routes_admin);
app.use("/favoritos", favoritoRoutes);
app.use("/productos", producto_routes);
app.use("/api/ia", geminiRoutes);
app.use("/pagos", pagoRoutes);
app.use("/ventas", ventaRoutes);

// =============================
// 📘 Swagger
// =============================
const swaggerDocs = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "API Agro SPA", version: "1.0.0" }
  },
  apis: ["./controllers/*.js"]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// =============================
// 📁 Multer configurado
// =============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "imgs"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + ext;
    cb(null, nombre);
  }
});

const upload = multer({ storage });

app.post("/subir", upload.single("foto"), (req, res) => {
  res.json({
    mensaje: "Imagen guardada",
    archivo: req.file.filename
  });
});

// =============================
// 🚀 Iniciar servidor
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor en puerto ${PORT}`));
