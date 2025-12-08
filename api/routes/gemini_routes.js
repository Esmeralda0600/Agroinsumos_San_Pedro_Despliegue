import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai/server";

const router = express.Router();

router.post("/interpretar", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: "No enviaste texto." });
    }

    if (!process.env.GEMINI_KEY) {
      return res.status(500).json({ error: "API KEY faltante" });
    }

    // NUEVA API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
    Eres un sistema de búsqueda de una tienda de agroinsumos.
    El usuario escribió: "${texto}".

    Responde SOLO en JSON:
    { "categoria": "..." }
    `;

    // NUEVO MÉTODO
    const result = await model.generateContent(prompt);

    const rawText = result.response.text();
    const clean = rawText.trim().replace(/```json|```/g, "");

    const jsonStr = clean.substring(clean.indexOf("{"), clean.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonStr);

    return res.json({ categoria: data.categoria });

  } catch (error) {
    console.error("❌ ERROR IA:", error);

    return res.status(500).json({
      error: "Fallo IA",
      mensaje: error?.message
    });
  }
});

export default router;
