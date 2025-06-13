import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import authRoutes from "./routes/auth.route.js";
import connectMongoDB from "./db/connectMongoDB.js";
import {Server} from "socket.io";
import { geo, getCoordinates } from "./nodeCode.js";
import bookingRoutes from "./routes/booking.route.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const adminSocketId = null;
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  socket.on("admin-login", () => {
    adminSocketId = socket.id;
    console.log("Admin logged in", adminSocketId);
  });
  socket.on("disconnect", () => {
    if(adminSocketId === socket.id) {
      adminSocketId = null;
      console.log("Admin logged out");
    }
    console.log("Socket disconnected");
  });
});

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

export const notifyAdmin = (message)=>{
  if(adminSocketId){
    io.to(adminSocketId).emit("new-ride",message);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Server running");
})
app.use("/api/auth", authRoutes);
app.post('/api/get-address',geo);
app.post('/api/get-co-ord',getCoordinates);
app.use("/bookings",bookingRoutes);
server.listen(PORT, () => {
  console.log(`Server is running at the port ${PORT}`);
  connectMongoDB();
});
