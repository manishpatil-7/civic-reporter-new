import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";
import Complaint from "../models/Complaint.js";
import { supportedLanguages } from "../data/authorityData.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const router = express.Router();

// Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration with safety settings
const modelConfig = {
  model: "gemini-2.5-flash",  // Using experimental model
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  ],
};

let visionModel, textModel;
try {
  visionModel = genAI.getGenerativeModel(modelConfig);
  textModel = genAI.getGenerativeModel(modelConfig);
  console.log("✅ Gemini models initialized");
} catch (err) {
  console.error("❌ Failed to initialize Gemini models:", err.message);
}

// ===================================================
// INVALID IMAGE DETECTION — List of non-civic items
// ===================================================
const INVALID_IMAGE_KEYWORDS = [
  "selfie", "person posing", "food", "meal", "restaurant", "table", "laptop",
  "computer", "phone", "mobile", "screenshot", "meme", "cartoon", "anime",
  "pet", "cat", "dog", "nature scenery", "sunset", "beach", "mountain",
  "indoor furniture", "bedroom", "living room", "bathroom mirror", "gym",
  "shopping", "mall", "clothes", "shoes", "makeup", "jewelry", "car interior",
  "dashboard", "video game", "social media", "wedding", "party", "birthday",
  "certificate", "document scan", "book page", "random object", "toy",
  "painting", "artwork", "abstract art"
];

const VALID_CIVIC_KEYWORDS = [
  "pothole", "broken road", "cracked pavement", "garbage", "waste", "trash",
  "litter", "debris", "streetlight", "broken light", "fallen pole", "drainage",
  "sewer", "blocked drain", "overflowing", "water logging", "flooding",
  "broken bench", "damaged wall", "graffiti", "broken sidewalk", "construction debris",
  "open manhole", "damaged railing", "fallen tree", "broken pipe", "water leak",
  "electricity pole damage", "signal broken", "traffic sign damage", "road damage",
  "cracked building", "public toilet", "dirty public space"
];

// ===================================================
// ANALYZE ENDPOINT — Vision-based civic issue detection + Image Validation
// ===================================================
router.post("/analyze", async (req, res) => {
  console.log("AI ROUTE HIT ✅");
  try {
    const { imageUrl, userName, locationAddress, authorityInfo } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    // Fallback if AI model not initialized
    if (!visionModel) {
      console.log("⚠️ AI model not available, returning fallback response");
      return res.json({
        problemType: "other",
        severity: "Medium",
        confidence: 50,
        description: "AI analysis temporarily unavailable. Please verify the issue details manually.",
        imageValidation: { isValid: true, reason: "AI unavailable — skipped validation", detectedContent: "unknown" },
        formalLetter: `To,\nThe Municipal Commissioner,\nMunicipal Corporation\n\nSubject: Complaint regarding civic issue\n\nRespected Sir/Madam,\n\nI am writing to bring to your attention a civic issue that requires immediate attention. Please review the attached image and details.\n\nThank you for your prompt action.\n\nYours faithfully,\n${userName || "Anonymous Citizen"}`
      });
    }

    // Build dynamic prompt inserts
    const nameInsert = userName
      ? `The complainant's name is "${userName}". Use this name in the formal letter like "I, ${userName}, ..."`
      : "";
    const locationInsert = locationAddress
      ? `The location of the issue is "${locationAddress}". Include this location in the letter.`
      : "";

    // Authority-aware letter generation
    let authorityInsert = "";
    if (authorityInfo) {
      const escapedHeader = authorityInfo.letterHeader ? authorityInfo.letterHeader.replace(/\n/g, '\\\\n') : '';
      authorityInsert = `
IMPORTANT — AUTHORITY ADDRESSING:
The complaint letter MUST be addressed to the correct authority. Use this EXACT header at the start of the formalLetter:

"${escapedHeader}"

Do NOT use "Municipal Commissioner" or "Municipal Corporation" unless specifically indicated above.
The authority type is: ${authorityInfo.authorityType}.
- If "gram_panchayat" → address to The Sarpanch of the Gram Panchayat
- If "municipal_council" → address to The Chief Officer of the Municipal Council
- If "municipal_corporation" → address to The Municipal Commissioner of the Municipal Corporation

Start the letter body after the header with "Subject: ..." and then the complaint text.
`;
    }

    const promptText = `You are a civic issue detection AI with IMAGE VALIDATION capabilities. 

**STEP 1 — IMAGE VALIDATION:**
First, determine if this image shows a REAL civic/infrastructure issue or something unrelated.

INVALID images (NOT civic issues) include:
- Selfies, people posing, group photos
- Food, meals, restaurants
- Laptops, phones, computers, screenshots
- Pets, animals, nature scenery
- Indoor furniture, bedrooms, bathrooms
- Shopping, clothes, personal items
- Memes, cartoons, artwork
- Random objects, toys, documents
- Cars (interior), video games

VALID civic issue images include:
- Potholes, broken roads, cracked pavements
- Garbage, waste, trash, litter, debris
- Broken/damaged streetlights, fallen poles
- Blocked drains, sewers, water logging
- Open manholes, broken pipes, water leaks
- Damaged public infrastructure (benches, walls, railings, sidewalks)
- Fallen trees on roads, construction debris
- Damaged traffic signals/signs

**STEP 2 — If VALID, analyze the issue:**

Issue Types (pick closest):
- "pothole" = visible holes, cracks, or damage in a road or pavement surface
- "garbage" = uncollected waste, trash piles, litter, debris in public spaces
- "streetlight" = broken, damaged, fallen, or non-functional street light poles
- "drainage" = blocked, overflowing, or damaged drains/sewers
- "other" = any other civic infrastructure issue
- "None" = the image does NOT show any civic issue

CONFIDENCE GUIDELINES (0 to 100):
- 85-100: Issue clearly visible
- 70-84: Visible but less clear
- 50-69: Ambiguous
- Below 50: Likely not a real issue

${nameInsert}
${locationInsert}
${authorityInsert}

Return ONLY valid JSON (no markdown, no backticks):
{
  "imageValidation": {
    "isValid": true/false,
    "reason": "<why valid or invalid — e.g. 'Image shows a pothole on road' or 'Image shows a selfie, not a civic issue'>",
    "detectedContent": "<what you see in the image — e.g. 'large pothole on asphalt road' or 'person taking selfie in mirror'>"
  },
  "problemType": "<type or None if invalid>",
  "severity": "<low|medium|high>",
  "confidence": <0-100>,
  "description": "<2-3 line description>",
  "formalLetter": "<formal complaint letter if valid, otherwise empty string>${authorityInfo ? ` addressed using the EXACT authority header provided above` : " to the local authority"}${userName ? `, starting with 'I, ${userName}, ...'` : ""}${locationAddress ? `, mentioning the location '${locationAddress}'` : ""}. Include Subject line, date, and closing with 'Yours faithfully'.>"
}

CRITICAL: If the image is INVALID (selfie, food, laptop, etc.), set imageValidation.isValid = false and set problemType = "None", confidence = 0, formalLetter = "".
CRITICAL: The output MUST be strictly valid JSON. You MUST escape all newlines inside strings using \\n. Do NOT use literal unescaped newlines in the formalLetter or anywhere else.
`;

    // Download image and convert to base64 for Gemini vision
    const imgResponse = await fetch(imageUrl);
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imgResponse.headers.get("content-type") || "image/jpeg";

    let rawText;
    let lastError;
    
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`Attempt ${i + 1}/3: Calling Gemini API...`);
        
        const result = await visionModel.generateContent({
          contents: [{
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              },
              {
                text: promptText
              }
            ]
          }]
        });
        
        const response = await result.response;
        rawText = response.text();
        console.log("✅ Gemini API Success");
        break; // Success
      } catch (err) {
        lastError = err;
        const msg = err.message || "";
        console.error(`❌ Attempt ${i + 1} failed:`, msg);
        
        // Check for rate limit or quota exceeded
        if ((msg.includes("429") || msg.includes("quota") || msg.includes("rate") || msg.includes("Please retry")) && i < 2) {
          const delay = Math.pow(2, i) * 3000; // Exponential backoff: 3s, 6s, 12s
          console.log(`⏳ Rate limited. Waiting ${delay}ms before retry...`);
          await sleep(delay);
        } else if (msg.includes("safety") || msg.includes("blocked")) {
          // Safety block - return fallback immediately
          console.log("⚠️ Content blocked by safety settings");
          return res.json({
            problemType: "other",
            severity: "Medium",
            description: "AI analysis blocked. Please describe the issue manually.",
            formalLetter: "AI analysis blocked by safety settings. Please describe the issue manually.",
            confidence: 0.5,
            priority: 20,
            imageValidation: { isValid: true, reason: "Safety blocked — skipped", detectedContent: "unknown" },
          });
        } else {
          throw err;
        }
      }
    }
    
    if (!rawText) {
      throw lastError || new Error("Failed to get response from Gemini API");
    }

    console.log("RAW AI RESPONSE:", rawText);

    // Clean markdown fences
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON block
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}") + 1;
    const jsonString = cleaned.substring(jsonStart, jsonEnd);

    let parsed;
    try {
      parsed = JSON.parse(jsonString);

      parsed.confidence = Number(parsed.confidence);

      // Normalize confidence: AI returns 0-100, frontend expects 0-1
      if (!parsed.confidence || isNaN(parsed.confidence)) {
        // Fallback confidence based on severity
        if (parsed.severity === "high") parsed.confidence = 0.9;
        else if (parsed.severity === "medium") parsed.confidence = 0.8;
        else if (parsed.severity === "low") parsed.confidence = 0.7;
        else parsed.confidence = 0.5;
      } else if (parsed.confidence > 1) {
        // Convert 0-100 to 0-1
        parsed.confidence = parsed.confidence / 100;
      }
    } catch (err) {
      console.log("JSON parse error:", err.message);
      return res.json({ raw: cleaned, error: "JSON Parse Error: " + err.message });
    }

    // Extract image validation result
    const imageValidation = parsed.imageValidation || { isValid: true, reason: "", detectedContent: "" };

    // Priority calculation
    let severityScore = 0;
    if (parsed.severity === "high") severityScore = 3;
    if (parsed.severity === "medium") severityScore = 2;
    if (parsed.severity === "low") severityScore = 1;

    const priority = severityScore * 10;

    const previewData = {
      imageUrl,
      problemType: parsed.problemType,
      severity:
        parsed.severity === "low"
          ? "Low"
          : parsed.severity === "high"
          ? "High"
          : "Medium",
      description: parsed.description,
      formalLetter: parsed.formalLetter,
      priority,
      confidence: parsed.confidence,
      imageValidation,
    };

    console.log("FINAL RESPONSE:", previewData);
    res.json(previewData);
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
    return res.json({
      problemType: "other",
      severity: "Medium",
      description: "AI temporarily unavailable.",
      formalLetter: "AI temporarily unavailable. Please describe manually.",
      confidence: 0,
      priority: 20,
      imageValidation: { isValid: true, reason: "AI error — skipped", detectedContent: "unknown" },
    });
  }
});


// ===================================================
// CATEGORY MATCH ENDPOINT — Cross-validate image vs selected category
// ===================================================
router.post("/validate-category", async (req, res) => {
  try {
    const { imageUrl, selectedCategory } = req.body;
    if (!imageUrl || !selectedCategory) {
      return res.status(400).json({ message: "imageUrl and selectedCategory required" });
    }

    if (!visionModel) {
      return res.json({ matches: true, confidence: 0, reason: "AI unavailable" });
    }

    const imgResponse = await fetch(imageUrl);
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imgResponse.headers.get("content-type") || "image/jpeg";

    const prompt = `You are a verification AI. The user selected "${selectedCategory}" as the complaint category.
Look at this image and determine if it matches the selected category.

Return ONLY valid JSON:
{"matches": true/false, "imageCategory": "<what the image actually shows>", "confidence": <0-100>, "reason": "<brief reason>"}`;

    const result = await visionModel.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      }]
    });

    const raw = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}") + 1;
    const parsed = JSON.parse(raw.substring(jsonStart, jsonEnd));

    res.json({
      matches: parsed.matches,
      imageCategory: parsed.imageCategory || "",
      selectedCategory,
      confidence: parsed.confidence || 0,
      reason: parsed.reason || "",
    });
  } catch (error) {
    console.error("Category validation error:", error.message);
    res.json({ matches: true, confidence: 0, reason: "Validation unavailable" });
  }
});


// ===================================================
// TRANSLATE ENDPOINT — On-demand letter translation
// ===================================================
router.post("/translate", async (req, res) => {
  console.log("TRANSLATE ROUTE HIT ✅");
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "text and targetLanguage required" });
    }

    // Validate language
    const lang = supportedLanguages.find((l) => l.code === targetLanguage);
    if (!lang) {
      return res.status(400).json({ message: `Unsupported language: ${targetLanguage}` });
    }

    // If English, just return the original
    if (targetLanguage === "en") {
      return res.json({ translatedText: text, language: lang });
    }

    let translatedText;
    let lastError;
    
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`Translation attempt ${i + 1}/3...`);
        
        const result = await textModel.generateContent({
          contents: [{
            role: "user",
            parts: [{
              text: `Translate the following formal complaint letter into ${lang.name} (${lang.nativeName}).

IMPORTANT RULES:
- Maintain the EXACT same formal tone and structure
- Keep the letter format (To, Subject, Body, Closing)
- Translate ALL text including authority titles, greetings, and closings
- Keep proper names (person names, place names) as-is but also add transliterated version in parentheses if helpful
- Use formal/respectful language appropriate for official government correspondence
- Do NOT add any extra text, explanation, or notes — return ONLY the translated letter

Letter to translate:
${text}`
            }]
          }]
        });
        
        const response = await result.response;
        translatedText = response.text().trim();
        console.log("✅ Translation Success");
        break;
      } catch (err) {
        lastError = err;
        const msg = err.message || "";
        console.error(`❌ Translation attempt ${i + 1} failed:`, msg);
        
        if ((msg.includes("429") || msg.includes("quota") || msg.includes("rate") || msg.includes("Please retry")) && i < 2) {
          const delay = Math.pow(2, i) * 3000;
          console.log(`⏳ Rate limited. Waiting ${delay}ms...`);
          await sleep(delay);
        } else if (msg.includes("safety") || msg.includes("blocked")) {
          return res.json({ 
            translatedText: text, 
            language: lang,
            warning: "Translation blocked by safety settings. Original text returned."
          });
        } else {
          throw err;
        }
      }
    }
    
    if (!translatedText) {
      throw lastError || new Error("Failed to translate");
    }

    res.json({ translatedText, language: lang });
  } catch (error) {
    console.error("Gemini Translation Error:", error.message);
    res.status(500).json({ message: "Translation failed: " + error.message });
  }
});

export default router;