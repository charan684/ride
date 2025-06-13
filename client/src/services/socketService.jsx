// src/socket.js
import { io } from 'socket.io-client';

class SocketSingleton {
  constructor() {
    if (!SocketSingleton.instance) {
      this.socket = null;
      SocketSingleton.instance = this;
    }

    return SocketSingleton.instance;
  }

  getSocket(role) {
    if (!this.socket) {
      this.socket = io('http://localhost:8000', {
        autoConnect: true,
        // auth: { token: 'your-auth-token' }, // optional
      });
      if(role === 'admin'){

        this.socket.emit("admin-login");
      }
      else if(role === 'user'){
        this.socket.emit('user-login',localStorage.getItem('token'));
      }
    }

    return this.socket;
  }
}

// Export a single shared instance
const socketInstance = new SocketSingleton();
export default socketInstance;
