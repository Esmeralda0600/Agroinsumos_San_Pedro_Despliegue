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

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
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

    // 🚨 FORMA CORRECTA DE EJECUTAR GEMINI
    const result = await model.generateContent([prompt]);

    console.log("📌 RAW RESULT COMPLETO:", JSON.stringify(result, null, 2));

    // 🚨 La respuesta de Gemini puede venir en diferentes formatos
    let rawText;

    if (result?.response?.text) {
      rawText = result.response.text();
    } else if (result?.response?.candidates) {
      rawText = result.response.candidates[0].content[0].text;
    } else {
      throw new Error("Formato inesperado de respuesta de Gemini.");
    }

    console.log("🔍 Respuesta cruda IA:", rawText);

    // === LIMPIEZA ===
    const clean = rawText.trim().replace(/```json|```/g, "");

    const first = clean.indexOf("{");
    const last = clean.lastIndexOf("}");

    if (first === -1 || last === -1) {
      console.error("❌ No se encontró JSON válido en la respuesta.");
      return res.status(500).json({ error: "Respuesta IA inválida." });
    }

    const jsonString = clean.substring(first, last + 1);

    console.log("🧪 JSON detectado:", jsonString);

    const data = JSON.parse(jsonString);

    return res.json({ categoria: data.categoria });

  } catch (error) {
    console.error("❌ ERROR IA:", error);
    return res.status(500).json({
      error: "Fallo IA",
      detalle: error.message
    });
  }
});

export default router;
