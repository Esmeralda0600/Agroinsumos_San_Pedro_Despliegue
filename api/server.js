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

dotenv.config();

const app = express();

// ==========================
// CORS FIX REAL ✔
// ==========================
const allowedOrigins = [
  "http://localhost:3000",
  "https://agroinsumos-san-pedro-despliegue-vl.vercel.app",
  "https://agroinsumos-san-pedro-despliegue-mq.vercel.app",
  "https://agroinsumos-san-pedro-despliegue-ub.vercel.app",
  "https://agroinsumos-san-pedro-despliegue.onrender.com"
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
  credentials: true
}));

app.use(express.json());

// Conexión a MongoDB
await connectMongo();

// Rutas API
app.use("/usuarios", agro_spa_routes);
app.use("/administradores", agro_spa_routes_admin);
app.use("/favoritos", favoritoRoutes);
app.use("/productos", producto_routes);

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
