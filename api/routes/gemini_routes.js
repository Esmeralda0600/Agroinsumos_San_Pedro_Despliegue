import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/interpretar", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: "No enviaste texto." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro-latest"
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
      {
        "categoria": "..."
      }
    `;

    // === Nueva forma correcta de leer ===
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();  // 👈 ESTA ES LA FORMA CORRECTA

    console.log("🔍 Respuesta cruda IA:", rawText);

    // === LIMPIEZA ===
    const clean = rawText.trim();
    const withoutTicks = clean.replace(/```json/g, "").replace(/```/g, "");

    const first = withoutTicks.indexOf("{");
    const last = withoutTicks.lastIndexOf("}");

    if (first === -1 || last === -1) {
      console.error("❌ No se encontró JSON válido en la respuesta.");
      return res.status(500).json({ error: "Respuesta IA inválida." });
    }

    const jsonString = withoutTicks.substring(first, last + 1);

    console.log("🧪 JSON detectado:", jsonString);

    const data = JSON.parse(jsonString);

    return res.json({ categoria: data.categoria });

  } catch (error) {
    console.error("❌ Error IA:", error);
    return res.status(500).json({ error: "Fallo IA" });
  }
});

export default router;
