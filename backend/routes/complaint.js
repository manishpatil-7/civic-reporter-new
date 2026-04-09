import express from "express";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// 🚀 GET ALL COMPLAINTS (For Dashboard & Admin)
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const mapped = complaints.map(c => {
       const doc = c.toJSON();
       return {
         ...doc,
         location: doc.locationArray,
         locationAddress: doc.location?.address || '',
         id: doc._id,
       };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 GET BY USER ID (For "My Complaints")
router.get("/user/:userId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    const mapped = complaints.map(c => {
       const doc = c.toJSON();
       return {
         ...doc,
         location: doc.locationArray,
         locationAddress: doc.location?.address || '',
         id: doc._id,
       };
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
    res.json({
      ...doc,
      location: doc.locationArray,
      locationAddress: doc.location?.address || '',
      id: doc._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🚀 CREATE COMPLAINT
router.post("/", async (req, res) => {
  try {
    const { 
      imageUrl, problemType, severity, description, 
      hindiDescription, formalLetter, userId, userName,
      location, department
    } = req.body;

    // Build location object — accept either { lat, lng, address } or fallback
    let locationData;
    if (location && location.lat && location.lng) {
      locationData = {
        lat: location.lat,
        lng: location.lng,
        address: location.address || '',
      };
    } else {
      locationData = {
        lat: 28.6139 + (Math.random() - 0.5) * 0.05,
        lng: 77.2090 + (Math.random() - 0.5) * 0.05,
        address: '',
      };
    }

    const complaint = new Complaint({
      imageUrl,
      problemType,
      severity,
      description,
      hindiDescription,
      formalLetter,
      userId: userId || '',
      userName: userName || 'Anonymous',
      department: department || 'General Municipal Department',
      location: locationData,
    });

    const saved = await complaint.save();
    const doc = saved.toJSON();
    res.status(201).json({
      ...doc,
      location: doc.locationArray,
      locationAddress: doc.location?.address || '',
      id: doc._id,
    });
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
    res.json({
      ...doc,
      location: doc.locationArray,
      locationAddress: doc.location?.address || '',
      id: doc._id,
    });
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
    res.json({
      ...doc,
      location: doc.locationArray,
      locationAddress: doc.location?.address || '',
      id: doc._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;