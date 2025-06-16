import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  pickupLocation: {
    address: { type: String },
    coordinates: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
  },

  destination: {
    address: { type: String },
    coordinates: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
  },

  //   rideType: {
  //     type: String,
  //     enum: ['shared', 'standard', 'premium'],
  //     default: 'standard',
  //   },

  status: {
    type: String,
    enum: ["requested", "assigned", "in_progress", "completed", "cancelled"],
    default: "requested",
  },

  //   estimatedFare: {
  //     type: Number,
  //     required: true,
  //   },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // if you ever add drivers as users
    default: null,
  },

  bookedAt: {
    type: Date,
    default: Date.now,
  },

  completedAt: {
    type: Date,
  },
  userName:{
    type: String,
    default:null,
  },
  userPhone:{
    type: String,
    default:null,
  },
});

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
