import express from "express";
import cors from "cors";
//import mongoose from "mongoose";
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
    apis: ["./controllers/*.js"], // comentarios con formato @openapi
};

dotenv.config(); // Cargar variables de entorno

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // para entender peticiones JSON

// Conexiones a bases de datos //config db.js
await connectMongo();

// Rutas
app.get("/", (req, res) => {
    res.send(`
    <h2> API corriendo correctamente</h2>
    <p>Entorno: <b>${process.env.NODE_ENV }</b></p>
    <p>Puerto: <b>${process.env.PORT}</b></p>`);
});

// Rutas 
app.use("/usuarios", agro_spa_routes);
app.use("/administratores",agro_spa_routes_admin)
app.use("/favoritos", favoritoRoutes);  
app.use("/productos", producto_routes);
// instancia de swagger
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Inicio del servido
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});