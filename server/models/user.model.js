import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  role: {
    type: String,
    enum: ["user", "admin", "rider"],
    default: "user",
  },
  //   profileImage: {
  //     type: String, // URL or path
  //     default: '',
  //   },
  location: {
    lat: {
      type: String,
    },
    lng: {
      type: String,
    },
  },
  status:{
    type:String,
    enum: ["free", "inactive","assigned"],
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
