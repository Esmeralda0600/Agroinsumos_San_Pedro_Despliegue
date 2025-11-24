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
      model: "gemini-1.5-flash"
    });

    const prompt = `
      Eres un sistema de búsqueda de una tienda de agroinsumos.
      El usuario escribió: "${texto}".

      Estas son las únicas categorías válidas:
      - SEMILLAS
      - FERTILIZANTES
      - PLAGUICIDAS
      - HERBICIDAS
      - FUNGICIDAS

      Responde SOLO en JSON:
      {
        "categoria": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const respuesta = result.response.text();

    return res.json(JSON.parse(respuesta));

  } catch (error) {
    console.error("Error IA:", error);
    return res.status(500).json({ error: "Fallo IA" });
  }
});

export default router;
