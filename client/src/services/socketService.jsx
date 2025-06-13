// src/socket.js
import { io } from 'socket.io-client';
export default class SocketSingleton {
  constructor() {
    if (!SocketSingleton.instance) {
      this.socket = io('http://localhost:3000', {
        autoConnect: false, // Optional: connect manually
        // auth: { token: 'your-auth-token' }, // Optional: token-based auth
      });

      SocketSingleton.instance = this;
    }

    return SocketSingleton.instance;
  }

  getSocket() {
    return this.socket;
  }
}

// Create and freeze the singleton

