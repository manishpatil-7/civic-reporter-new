import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },

  afterImageUrl: {
    type: String,
  },

  problemType: {
    type: String,
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
    type: String,
  },

  hindiDescription: {
    type: String,
  },

  // User who submitted
  userId: {
    type: String,
    default: "",
  },

  userName: {
    type: String,
    default: "Anonymous",
  },

  // Smart department suggestion
  department: {
    type: String,
    default: "General Municipal Department",
  },

  location: {
    lat: Number,
    lng: Number,
    address: String,
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
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

// Virtual field for location array for map rendering [lat, lng]
complaintSchema.virtual('locationArray').get(function() {
  if (this.location && this.location.lat && this.location.lng) {
    return [this.location.lat, this.location.lng];
  }
  return [28.6139 + (Math.random() - 0.5) * 0.05, 77.2090 + (Math.random() - 0.5) * 0.05];
});

// Ensure virtuals are included in JSON responses
complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
console.log("Complaint model loaded ✅");

export default Complaint;