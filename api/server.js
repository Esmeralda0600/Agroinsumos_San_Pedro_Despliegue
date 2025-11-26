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



dotenv.config();

const app = express();

// =============================
// 🎯 CORS CONFIG
// =============================
const allowedOrigins = [
  "http://localhost:3000",

  "http://localhost:4000",
  "https://agroinsumos-san-pedro-despliegue-us-eight.vercel.app",

  "https://agroinsumos-san-pedro-despliegue.onrender.com",
  "https://agroinsumos-san-pedro-despliegue-kafy.onrender.com",
  "https://agroinsumos-san-pedro-despliegue-ad-seven.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("🌍 ORIGIN SOLICITANDO:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS bloqueado por seguridad"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// ❗ IMPORTANTE: QUITAR ESTO ❌
// app.options("*", cors());

app.use(express.json());

// Conexión
await connectMongo();

// Rutas API
app.use("/usuarios", agro_spa_routes);
app.use("/administradores", agro_spa_routes_admin);
app.use("/favoritos", favoritoRoutes);
app.use("/productos", producto_routes);
app.use("/api/ia", geminiRoutes);
app.use("/pagos", pagoRoutes);
app.use("/ventas", ventaRoutes);

// Swagger
const swaggerDocs = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "API Agro SPA", version: "1.0.0" },
  },
  apis: ["./controllers/*.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor en puerto ${PORT}`));
