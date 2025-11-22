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

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Agro_spa",
            version: "1.0.0",
            description: "API para gestionar Agro_spa en MongoDB",
        },
    },
    apis: ["./controllers/*.js"],
};

dotenv.config();

const app = express();

// ==========================
// 🔥 CONFIGURAR CORS CORRECTAMENTE
// ==========================
const allowedOrigins = [
  "http://localhost:5500", 
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "https://agroinsumos-san-pedro-despliegue-vl.vercel.app",  // ✔ tu frontend REAL
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, móvil)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS bloqueado: Origin no permitido -> " + origin));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());

// Conexión a MongoDB
await connectMongo();

// Ruta raíz
app.get("/", (req, res) => {
    res.send(`
    <h2> API corriendo correctamente</h2>
    <p>Entorno: <b>${process.env.NODE_ENV }</b></p>
    <p>Puerto: <b>${process.env.PORT}</b></p>`);
});

// Rutas API
app.use("/usuarios", agro_spa_routes);
app.use("/administratores", agro_spa_routes_admin)
app.use("/favoritos", favoritoRoutes);
app.use("/productos", producto_routes);

// Swagger
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Iniciar servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});
