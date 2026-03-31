import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Complaint from "../models/Complaint.js"; // 🔥 ADD THIS

const router = express.Router();

router.post("/analyze", async (req, res) => {
  console.log("AI ROUTE HIT ✅");
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    // Dynamic intialization ensures process.env is read at runtime not import time
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    // 🔥 Step 1: Download image using native fetch which works better on Render
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();

    // 🔥 Step 2: Convert to base64
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // 🔥 Step 3: Send to Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            },
            {
              text: `
You are an AI system for detecting civic issues from images.

Analyze the image and return ONLY valid JSON in this exact format:

{
  "problemType": "pothole | garbage | streetlight | drainage | other",
  "severity": "low | medium | high",
  "description": "Simple explanation in 2-3 lines",
  "formalLetter": "Write a formal complaint letter to Municipal Corporation",
  "hindiDescription": "Same description in Hindi"
}

Rules:
- ONLY return JSON
- NO explanation outside JSON
- NO markdown
- problemType must be one of the given values
- severity must be low, medium, or high
`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    });

    // 🔥 Extract response
    const rawText = result.response.text();
    console.log("RAW AI RESPONSE:", rawText);

    // 🔥 Clean markdown
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔥 Extract JSON
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}") + 1;
    const jsonString = cleaned.substring(jsonStart, jsonEnd);

    let parsed;

    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.log("JSON parse error:", err.message);
      return res.json({ raw: cleaned, error: "JSON Parse Error: " + err.message });
    }

    // 🔥 Priority calculation
    let severityScore = 0;
    if (parsed.severity === "high") severityScore = 3;
    if (parsed.severity === "medium") severityScore = 2;
    if (parsed.severity === "low") severityScore = 1;

    const priority = severityScore * 10;

    // 🔥 Prepare to send data strictly back to UI for review (NO SAVE)
    const previewData = {
      imageUrl,
      problemType: parsed.problemType,
      severity: parsed.severity === 'low' ? 'Low' : parsed.severity === 'high' ? 'High' : 'Medium', // Title Case
      description: parsed.description,
      formalLetter: parsed.formalLetter,
      hindiDescription: parsed.hindiDescription,
      priority
    };

    // ✅ SEND TO FRONTEND
    res.json(previewData);

  } catch (error) {
    console.error("Gemini Error:", error.message);
    // Send full error details.
    res.status(500).json({ 
      message: "AI failed", 
      errorReason: error.message,
      stack: error.stack 
    });
  }
});

export default router;