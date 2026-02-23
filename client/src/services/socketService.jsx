// src/services/socketService.jsx
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? "https://ride-backend-zstk.onrender.com";

class SocketSingleton {
  constructor() {
    if (!SocketSingleton.instance) {
      this.socket = null;
      SocketSingleton.instance = this;
    }
    return SocketSingleton.instance;
  }

  clearSocket() {
    console.log("clear");
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    } catch (error) {
      console.log("Clear socket : ", error);
    }
  }

  getSocket(role) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
      });

      // Emit login ONLY after socket is confirmed connected (fixes race condition bug #7)
      this.socket.on("connect", () => {
        console.log("✅ Client socket connected:", this.socket.id);
        if (role === 'admin') {
          this.socket.emit("admin-login");
        } else if (role === 'user') {
          this.socket.emit('user-login', localStorage.getItem('token'));
        }
      });

      this.socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });
    }

    return this.socket;
  }
}

// Export a single shared instance
const socketInstance = new SocketSingleton();
export default socketInstance;
