// src/socket.js
import { useContext } from 'react';
import { io } from 'socket.io-client';
import MapContext from '../context/AppContext';


class SocketSingleton {
  constructor() {
    if (!SocketSingleton.instance) {
      this.socket = null;
      SocketSingleton.instance = this;
    }
    
    return SocketSingleton.instance;
  }
  clearSocket(){
    console.log("clear");
    try {
      if(this.socket){
        this.socket.disconnect();
        this.socket=null;
      }
      
    } catch (error) {
      console.log("Clear socket : ",error)
    }
  }
  getSocket(role) {
    // const {apiUrl} = useContext(MapContext);
    if (!this.socket) {
      this.socket = io(`https://ride-74l5.onrender.com`, {
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
