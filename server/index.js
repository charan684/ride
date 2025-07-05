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
      const userId = decoded.userId.toString();
      socket.join(userId); 
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
  socket.on("new_ride_request", (data) => {
  console.log("Received new ride request from user:", data);

  if (adminSocketId) {
    io.to(adminSocketId).emit("new_ride_request", data);
    console.log("Sent ride request to admin:", adminSocketId);
  } else {
    console.warn("No admin connected to receive ride request.");
  }
});
  socket.on("rider-login", async (token) => {
    console.log(token);

    try {
      console.log(token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded:",decoded);
      const driverId = decoded.userId.toString();
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
  socket.on("join-admin-map", () => {
  socket.join("admin-map");
  console.log("Admin joined admin-map room");
});
socket.on("start-tracking-driver", ({ userId, riderId, rideId }) => {
  console.log("🔁 User requested live tracking:", { userId, riderId, rideId });

  const driverData = drivers.find(driver => driver.driverId === riderId);

  if (!driverData) {
    console.warn("🚫 Driver not found for tracking:", riderId);
    return;
  }

  const latestLocation = driverData.location;
  if (latestLocation) {
    // Send the current driver location immediately
    io.to(socket.id).emit("live-driver-location", {
      location: latestLocation,
      riderId,
      rideId,
      userId
    });
  }

  // Optionally: Set up a stream to send updates continuously
  // But it's better if the driver keeps sending `driver-location` and we emit it below

  // Already handled in your existing "driver-location" listener:
  // Emit to user every time location comes in
});


socket.on("driver-location", async (data) => {
  console.log("Got location update", data);
  const { location, userId, riderId, rideId } = data;
  const socketId = socket.id;
  drivers = drivers.filter((d) => d.driverId !== riderId);
  drivers.push({
  driverId:riderId,
  socketId,
  location: { lat:location.latitude, lng:location.longitude },
});
  try {
    if (!location || location.latitude == null || location.longitude == null) {
      console.warn("Missing location data:", location);
      return;
    }

    const lat = String(location.latitude);
    const lng = String(location.longitude);

    if (isNaN(Number(lat)) || isNaN(Number(lng))) {
      console.warn("Invalid coordinates:", { lat, lng });
      return;
    }

    // Update driver document (riderId is driver's _id)
    const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

if (isValidObjectId(riderId)) {
  const result = await User.updateOne(
    { _id: riderId },
    {
      $set: {
        location: {
          lat,
          lng,
        },
      },
    }
  );
  if (result.modifiedCount === 0) {
      console.warn("Driver document not updated. ID:", riderId);
    } else {
      console.log(`Location updated for driver ${riderId}:`, { lat, lng });
    }
} else {
  console.warn("Invalid riderId:", riderId);
}


    
  
    // Emit to user
    const userIndex = users.find((u) => u.userId === userId);
    if (userIndex) {
      io.to(userIndex.socketId).emit("driver-location", {
        location: { lat, lng },
        riderId,
        rideId,
        userId,
      });
    }

    // Emit to admin map
    io.to("admin-map").emit("driver-location", {
      location: { lat, lng },
      riderId,
      driverId: riderId,
      username: `Driver-${riderId?.slice(0, 5) || "N/A"}`,
    });

  } catch (err) {
    console.error("Failed to update driver location:", err);
  }
});

// socket.on('start-ride')

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
  console.log("Notifying driver: ", message);
  const driverId = message.driver.toString();
  const userId = message.user.toString();
  const rideId = message._id.toString();

  // Find driver socket and location from in-memory store
  const driverData = drivers.find(driver => driver.driverId === driverId);
  const driverSocketId = driverData?.socketId;
  const latestLocation = driverData?.location; // ← already set in "driver-location" event

  // Find user socket
  const userSocketId = users.find(user => user.userId === userId)?.socketId;
  if (driverSocketId) {
    // Send ride details to driver
    io.to(driverSocketId).emit("new-ride", message);

    // Send "start-tracking" signal
    io.to(driverSocketId).emit("start-tracking", {
      riderId: driverId,
      rideId,
      userId,
    });

    console.log("✅ Emitted 'start-tracking' to driver:", driverSocketId);
  }

  // ✅ Emit driver's current location to user
  if (userSocketId && latestLocation?.lat && latestLocation?.lng) {
    io.to(userSocketId).emit("driver-location", {
      location: {
        lat: latestLocation.lat,
        lng: latestLocation.lng,
      },
      riderId: driverId,
      rideId,
      userId,
    });

    console.log("✅ Sent driver's latest location to user:", userSocketId);
  } else {
    console.warn("⚠️ Could not emit driver's location: missing socket or location");
  }

  // Update driver's DB status
  const driver = await User.findById(driverId);
  driver.status = "assigned";
  await driver.save();
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
const allowedOrigins = [
  "https://ride-burc.onrender.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));


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
