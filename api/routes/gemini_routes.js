import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/interpretar", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: "No enviaste texto." });
    }

    if (!process.env.GEMINI_KEY) {
      console.error("❌ No existe GEMINI_KEY en Render");
      return res.status(500).json({ error: "API KEY faltante" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    // MODELO CORRECTO
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
    });

    const prompt = `
      Eres un sistema de búsqueda de una tienda de agroinsumos.
      El usuario escribió: "${texto}".

      Estas son las únicas categorías válidas:
      - FERTILIZANTES
      - HERBICIDAS
      - FUNGICIDAS
      - ADHERENTES
      - INSECTICIDAS
      - BACTERICIDAS
      - ENRAIZADOR
      - SYGENTA
      - FORMUVEG
      - ALIAGRO
      - ULTRASOL
      - BAYER
      - AGROENZYMAS
      - UPL
      - DRAGON
      - ULTRAQUIMIA
      - ABAMECTINA
      - ESTREPTOMICINA
      - PEROXIDO DE HIDROGENO
      - FLONICAMID
      - COBRE
      - IMIDACLOPRID
      - PARAQUAT
      - BORO
      - ZINC
      - CALCIO
      - 6-BENCILAMINOPURINA
      - NITROGENO
      - CITOCINA
      - FOSFORO
      - AGENTES TENSOACTIVOS
      - ACIDO GIBERELICO
      - SUSTANCIAS HUMICAS
      - TIOCYCLAM
      - BUPROFEZIN
      - PROPAMOCARB
      - HIDROXIDO CUPRICO
      - ATRAZINA
      - DIMETOATO
      - CLORPIRIFOS
      - FOMESAFEN
      - AMINA
      - CARBENDAZIM
      - TIOFANATO DE METILO

      Responde SOLO en JSON:
      { "categoria": "..." }
    `;

    console.log("📌 Texto recibido:", texto);
    console.log("📌 GEMINI usando modelo:", "models/gemini-1.5-flash");

    // 🚨 LLAMADA CORRECTA → NO ENVÍES ARRAY
    const result = await model.generateContent(prompt);

    console.log("📌 RAW RESULT:", JSON.stringify(result, null, 2));

    let rawText = "";

    if (result?.response?.text) {
      rawText = result.response.text();
    } else if (result?.response?.candidates) {
      rawText = result.response.candidates[0].content[0].text;
    } else {
      throw new Error("Formato inesperado de respuesta de Gemini");
    }

    console.log("🔍 Texto IA:", rawText);

    const clean = rawText.trim().replace(/```json|```/g, "");

    const first = clean.indexOf("{");
    const last = clean.lastIndexOf("}");

    if (first === -1 || last === -1) {
      return res.status(500).json({ error: "JSON no encontrado en respuesta IA" });
    }

    const jsonString = clean.substring(first, last + 1);

    console.log("🧪 JSON Detectado:", jsonString);

    const data = JSON.parse(jsonString);

    return res.json({ categoria: data.categoria });

  } catch (error) {
    console.error("❌ ERROR IA COMPLETO:", error);

    return res.status(500).json({
      error: "Fallo IA",
      mensaje: error?.message,
      nombre: error?.name,
      stack: error?.stack
    });
  }
});

export default router;
