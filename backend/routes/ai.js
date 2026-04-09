import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Complaint from "../models/Complaint.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const router = express.Router();

router.post("/analyze", async (req, res) => {
  console.log("AI ROUTE HIT ✅");
  try {
    const { imageUrl, userName, locationAddress } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    // Download image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Build dynamic prompt with optional name and location
    const nameInsert = userName ? `The complainant's name is "${userName}". Use this name in the formal letter like "I, ${userName}, ..."` : '';
    const locationInsert = locationAddress ? `The location of the issue is "${locationAddress}". Include this location in both letters.` : '';

    let result;
    for (let i = 0; i < 3; i++) {
      try {
        result = await model.generateContent({
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

Analyze the image VERY STRICTLY.

Rules:
- Only detect a problem if it is CLEARLY visible.
- If even slightly unsure → return "None".
- DO NOT guess.
- Ignore shadows, lighting, reflections, or unclear patterns.
- A clean road is NOT a pothole.
- A shadow is NOT garbage.
- A working streetlight is NOT broken.
- hindiFormalLetter must be an accurate translation of formalLetter, not a different message.

Detection Guidelines:
- pothole → visible hole/crack in road surface
- garbage → visible waste piles (plastic, trash, debris)
- streetlight → broken/fallen/off light pole clearly visible
- drainage → blocked or overflowing drain

${nameInsert}
${locationInsert}

Return ONLY valid JSON:

{
  "problemType": "pothole | garbage | streetlight | drainage | other | None",
  "severity": "low | medium | high",
  "confidence": 0-1,
  "description": "Simple explanation in 2-3 lines",
  "formalLetter": "Write a formal complaint letter to Municipal Corporation in English${userName ? `, starting with 'I, ${userName}, ...'` : ''}${locationAddress ? `, mentioning the location '${locationAddress}'` : ''}",
  "hindiFormalLetter": "Write the same formal complaint letter in Hindi${userName ? `, using the name '${userName}'` : ''}${locationAddress ? `, mentioning the location '${locationAddress}'` : ''}"
}
`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2
          }
        });
        break; // Success
      } catch (err) {
        if (err.message.includes("503")) {
          console.log(`Retrying... (${i + 1}/3)`);
          if (i === 2) throw err; // Throw on final attempt
          await sleep(2000); // Wait 2 sec
        } else {
          throw err;
        }
      }
    }

    // Extract response
    const rawText = result.response.text();
    console.log("RAW AI RESPONSE:", rawText);

    // Clean markdown
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}") + 1;
    const jsonString = cleaned.substring(jsonStart, jsonEnd);

    let parsed;

    try {
      parsed = JSON.parse(jsonString);
      if (!parsed.hindiFormalLetter) {
        parsed.hindiFormalLetter = "हिंदी पत्र उपलब्ध नहीं है";
      }

      parsed.confidence = Number(parsed.confidence);

      if (!parsed.confidence || isNaN(parsed.confidence)) {
        if (parsed.severity === "high") parsed.confidence = 0.9;
        else if (parsed.severity === "medium") parsed.confidence = 0.75;
        else if (parsed.severity === "low") parsed.confidence = 0.6;
        else parsed.confidence = 0.5;
      }

    } catch (err) {
      console.log("JSON parse error:", err.message);
      return res.json({ raw: cleaned, error: "JSON Parse Error: " + err.message });
    }

    // Priority calculation
    let severityScore = 0;
    if (parsed.severity === "high") severityScore = 3;
    if (parsed.severity === "medium") severityScore = 2;
    if (parsed.severity === "low") severityScore = 1;

    const priority = severityScore * 10;

    const previewData = {
      imageUrl,
      problemType: parsed.problemType,
      severity: parsed.severity === 'low' ? 'Low' : parsed.severity === 'high' ? 'High' : 'Medium',
      description: parsed.description,
      formalLetter: parsed.formalLetter,
      hindiFormalLetter: parsed.hindiFormalLetter,
      priority,
      confidence: parsed.confidence
    };
    console.log("FINAL RESPONSE:", previewData);
    res.json(previewData);

  } catch (error) {
    console.error("Gemini Error:", error.message);
    return res.json({
      problemType: "other",
      severity: "Medium",
      description: "AI temporarily unavailable.",
      formalLetter: "AI temporarily unavailable. Please describe manually.",
      hindiFormalLetter: "AI अस्थायी रूप से उपलब्ध नहीं है। कृपया विवरण स्वयं भरें।",
      confidence: 0,
      priority: 20
    });
  }
});

export default router;