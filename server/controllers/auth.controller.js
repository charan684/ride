import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const signUpUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    console.log(username, email, password, phone);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Optional: Add password strength check
    // if (password.length < 6) {
    //   return res.status(400).json({ error: "Password must be at least 6 characters long" });
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      phone,
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    await newUser.save();

    generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        phone: newUser.phone,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!email || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        type: user.type,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getMe = async (req, res) => {
  
  try {

    const user = await User.findById(req.user.userId).select("-password");
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const driverSignup = async (req, res) => {
  // console.log("Here");
  try {
    const { email, password, name, phone, location } = req.body;
    // console.log(email,password)
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "User exists" });
    console.log(password);
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      username: name,
      phone,
      location,
      role: "rider",
    });
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
