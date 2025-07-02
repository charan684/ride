import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import http from "http";
import authRoutes from "./routes/auth.route.js";
import connectMongoDB from "./db/connectMongoDB.js";
import { Server } from "socket.io";
import { geo, getCoordinates } from "./nodeCode.js";
import bookingRoutes from "./routes/booking.route.js";
import jwt from "jsonwebtoken";
import locationRoute from "./routes/location.route.js";
import User from "./models/user.model.js";
import driverRoutes from "./routes/driver.route.js";
import userRoutes from "./routes/user.route.js";
import axios from "axios";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // VERY IMPORTANT
});
let adminSocketId = null;
let users = [];
let drivers = [];
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  socket.on("join-room", (roomId) => {
  socket.join(roomId);
  console.log(`Socket ${socket.id} joined room: ${roomId}`);
});

  socket.on("admin-login", () => {
    adminSocketId = socket.id;
    console.log("Admin logged in", adminSocketId);
  });
  socket.on("user-login", (token) => {
    console.log("Got a user login");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      const socketId = socket.id;
      users = users.filter((u) => u.userId !== userId);
      users.push({ userId, socketId });

      // console.log("Users: ", users);
    } catch (error) {
      console.error("Invalid token:", error.message);
      socket.emit("login-error", "Invalid authentication token");
      socket.disconnect();
    }
  });

  socket.on("rider-login", async (token) => {
    console.log(token);

    try {
      console.log(token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded:",decoded);
      const driverId = decoded.userId;
      const socketId = socket.id;
      console.log("Driver logged in", driverId, socketId);

      const driverDetails = await User.findById(driverId);
      if (adminSocketId) {
        io.to(adminSocketId).emit("new-driver", driverDetails);
      }
      drivers = drivers.filter((d) => d.driverId !== driverId);
      drivers.push({ driverId, socketId });
      // console.log("Drivers: ", drivers);
    } catch (error) {
      console.error("Driver login failed:", error.message);
      socket.emit("login-error", "Invalid authentication token");
      socket.disconnect();
    }
  });

  socket.on("ride-complete", (data) => {
    const { rideId, userId } = data;
    if (adminSocketId) {
      io.to(adminSocketId).emit("ride-complete", { rideId, userId });
    }
    const userIndex = users.find((u) => u.userId === userId);
    if (userIndex) {
      io.to(userIndex.socketId).emit("ride-complete", { rideId, userId });
    }
  });
 socket.on("driver-location", async (data) => {
  console.log("Got location update", data);
  const { location, userId, riderId, rideId } = data;

  const userIndex = users.find((u) => u.userId === userId);  // FIXED
  if (!userIndex) {
    console.log("User is not tracking");
    return;
  }

  io.to(userIndex.socketId).emit("driver-location", {
  location,
  riderId,
  rideId,
});


  const driver = await User.findOne({ _id: userId });
  if (driver) {
    driver.location = location;
    await driver.save();
  }
});

  socket.on('locationUpdate', (data) => {
    
    const { latitude, longitude, timestamp } = data.location;
    if (latitude && longitude) {
      const lastKnownLocation = { latitude, longitude, timestamp };
      console.log('[Socket] Received location:', lastKnownLocation);
      io.emit('riderLocation', lastKnownLocation);
    } else {
      console.warn('[Socket] Incomplete data:', data);
    }
  });
  socket.on("disconnect", () => {
    if (adminSocketId === socket.id) {
      adminSocketId = null;
      console.log("Admin logged out");
    }
console.log('[Socket] Client disconnected:', socket.id);
    const userIndex = users.findIndex((user) => user.socketId === socket.id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      console.log("User disconnected");
    }

    const driverIndex = drivers.findIndex(
      (driver) => driver.socketId === socket.id
    );
    if (driverIndex !== -1) {
      if (adminSocketId) {
        io.to(adminSocketId).emit(
          "driver-disconnected",
          drivers[driverIndex].driverId
        );
      }
      drivers.splice(driverIndex, 1);
      console.log("Driver disconnected");
    }
  });
});

const PORT = process.env.PORT || 8001;

export const notifyAdmin = (message) => {
  // console.log("Notifying admin: ", message);
  if (adminSocketId) {
    // console.log("Sending notification to admin", adminSocketId);
    io.to(adminSocketId).emit("new-ride", message);
  }
};

export const notifyDriver = async (message) => {
  // console.log("Notifying driver: ", message);
  const driverId = message.driver.toString();
  // console.log("drivers: ", drivers,driverId);
  const driverSocketId = drivers.find(
    (driver) => driver.driverId === driverId
  )?.socketId;
  // console.log(driverSocketId);
  if (driverSocketId) {
    // console.log("Sending notification to driver", driverSocketId);
    io.to(driverSocketId).emit("new-ride", message);
  }
  const driver = await User.findById(message.driver);
  driver.status = "assigned";
};
export const notifyUser = (message) => {
  // console.log("Notifying user: ", message);
  const userId = message.user.toString();
  // console.log("users: ", users,userId);
  const userSocketId = users.find((user) => user.userId === userId)?.socketId;
  // console.log(userSocketId);
  if (userSocketId) {
    // console.log("Sending notification to user", userSocketId);
    io.to(userSocketId).emit("ride-booked", message);
  }
};
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Server running");
});
app.get("/active-riders", async (req, res) => {
  try {
    const activeRidersIds = drivers.map((driver) => driver.driverId);
    const activeRiderDetails = await Promise.all(
      drivers.map((driver) => User.findById(driver.driverId))
    );
    // console.log(drivers);
    // console.log(activeRiderDetails)
    res.json(activeRiderDetails);
  } catch (error) {
    console.error("Error fetching active riders:", error);
    res.status(500).json({ error: "Failed to fetch active riders" });
  }
});

app.use("/api/auth", authRoutes);
app.post("/api/get-address", geo);
app.post("/api/get-co-ord", getCoordinates);
app.use("/driver", driverRoutes);
app.use("/user", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/locationUpdate", locationRoute);
// Backend: /api/register-device
app.post("/api/register-device", async (req, res) => {
  try {
    const { userId, playerId, pushToken, deviceType } = req.body;

    // Update or create device record in MongoDB
    await db.collection("devices").updateOne(
      { userId: userId },
      {
        $set: {
          playerId: playerId,
          pushToken: pushToken,
          deviceType: deviceType,
          lastUpdated: new Date(),
          isActive: true,
        },
      },
      { upsert: true }
    );

    res.json({ success: true, message: "Device registered successfully" });
  } catch (error) {
    console.error("Device registration error:", error);
    res.status(500).json({ error: "Failed to register device" });
  }
});

app.post("/getCoordsFromAdd", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "YourAppName/1.0",
        },
      }
    );

    if (response.data.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    const { lat, lon } = response.data[0];
    res.json({ latitude: lat, longitude: lon });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at the port ${PORT}`);
  connectMongoDB();
});
