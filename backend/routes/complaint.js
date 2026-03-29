import express from "express";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// 🚀 GET ALL COMPLAINTS (For Dashboard & Admin)
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    // Transform location coordinates so Leaflet works directly off `c.location`
    const mapped = complaints.map(c => {
       const doc = c.toJSON();
       return { ...doc, location: doc.locationArray, id: doc._id };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 GET BY ID (For Details Page)
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });
    const doc = complaint.toJSON();
    res.json({ ...doc, location: doc.locationArray, id: doc._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 CREATE COMPLAINT (Receives JSON from frontend after AI analysis)
router.post("/", async (req, res) => {
  try {
    const { 
      imageUrl, problemType, severity, description, 
      hindiDescription, formalLetter 
    } = req.body;

    const complaint = new Complaint({
      imageUrl,
      problemType,
      severity,
      description,
      hindiDescription,
      formalLetter,
      // Create random fuzzy coordinate since frontend doesn't supply gps yet natively
      location: {
         lat: 28.6139 + (Math.random() - 0.5) * 0.05,
         lng: 77.2090 + (Math.random() - 0.5) * 0.05
      }
    });

    const saved = await complaint.save();
    const doc = saved.toJSON();
    res.status(201).json({ ...doc, location: doc.locationArray, id: doc._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// 🚀 UPDATE COMPLAINT (For Admin Panel status & after image)
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    const doc = updated.toJSON();
    res.json({ ...doc, location: doc.locationArray, id: doc._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 UPVOTE COMPLAINT
router.patch("/:id/upvote", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });
    
    complaint.upvotes += 1;
    await complaint.save();
    
    const doc = complaint.toJSON();
    res.json({ ...doc, location: doc.locationArray, id: doc._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;