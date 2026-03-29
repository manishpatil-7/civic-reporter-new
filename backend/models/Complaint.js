import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },

  afterImageUrl: {
    type: String, // Added for Admin "Resolution Evidence"
  },

  problemType: {
    type: String,
    // Note: AI might return slightly different strings, so we remove the strict enum 
    // to allow AI's dynamic detections (e.g. "Broken Streetlight") but default to "Other"
    default: "Other",
  },

  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "low", "medium", "high"],
    default: "Medium",
  },

  priority: {
    type: Number,
    default: 0,
  },

  description: {
    type: String,
  },

  formalLetter: {
    type: String, // Added for AI generation
  },

  hindiDescription: {
    type: String, // Added for WOW feature
  },

  location: {
    lat: Number,
    lng: Number,
    address: String,
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"], // Updated to match FrontEnd caps
    default: "Pending"
  },

  upvotes: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for location array to easily inject into leaflet map `[lat, lng]`
complaintSchema.virtual('locationArray').get(function() {
  if (this.location && this.location.lat && this.location.lng) {
    return [this.location.lat, this.location.lng];
  }
  return [28.6139 + (Math.random() - 0.5) * 0.05, 77.2090 + (Math.random() - 0.5) * 0.05]; // fallback
});

// Ensure virtuals are included in JSON responses
complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
console.log("Complaint model loaded ✅");

export default Complaint;