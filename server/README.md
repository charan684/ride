# Ride Tracking System - Server Documentation

Welcome to the backend server module of the Ride Tracking System. This document serves as the primary resource for understanding the product, setting up the environment, and navigating the codebase for future development.

## 📖 Product Overview

The Ride Tracking System backend is the core engine that powers a seamless ride-booking and tracking experience. It connects riders, drivers, and administrators in real time. 

**Key Capabilities:**
- **Real-Time Tracking:** Uses Socket.io to keep live tracking data in sync across all connected clients (Riders, Drivers, Admins).
- **Ride Booking Engine:** REST APIs to request, accept, and manage rides.
- **Authentication:** Secure JSON Web Token (JWT) based authentication with bcrypt password hashing.
- **Geolocation Services:** Integration with `node-geocoder` and OpenStreetMap to dynamically calculate coordinates and address lookups.
- **Admin Dashboard Integration:** Specific socket channels (`admin-map`) to monitor all active drivers on a global map.

---

## 🚀 Setup & Installation Guide

This section is for anyone looking to run the server on their local machine or for a production deployment.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URL)

### 1. Install Dependencies
Navigate to the `server` directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `server` directory and populate it with the necessary variables. An example configuration might look like:
```env
PORT=8001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Start the Server
For development mode (with auto-reloading via `nodemon`):
```bash
npm run dev
```

For production mode:
```bash
npm start
```
The server will typically start on `http://localhost:8001`.

---

## 👩‍💻 Developer Manual (Codebase Walkthrough)

If you are a new developer joining the project, this section will help you understand the architectural flow.

### Tech Stack
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Real-Time Communication:** Socket.io
- **Utilities:** Axios, node-geocoder, jsonwebtoken, bcrypt

### Project Structure
```text
server/
├── controllers/    # Business logic for express routes (auth, booking, driver, user)
├── db/             # Database connection logic
├── middleware/     # Custom Express middlewares (e.g., authentication guards)
├── models/         # Mongoose schema definitions (User, Ride, etc.)
├── routes/         # Express route registrations mapping paths to controllers
├── services/       # Any 3rd-party integration services
├── utils/          # Helper modules and constants
├── index.js        # Application entry point, Express setup, WebSocket initialization
└── package.json    # Project dependencies and script aliases
```

### Understanding the Flow (How it works)

1. **HTTP Requests (REST API):**
   - The application starts in `index.js`.
   - Incoming REST requests are routed through `/routes` (e.g., `/api/auth`, `/bookings`, `/driver`, `/user`).
   - The routes delegate processing to `controllers/`, which handle the database interactions via `models/`.

2. **WebSocket Events (Socket.io):**
   - **`index.js`** handles global WebSocket connections and rooms. 
   - **Authentication:** Sockets emit `user-login` or `rider-login` with JWT tokens. The server stores active connections in memory arrays (`users`, `drivers`).
   - **Real-Time Locations:** Drivers emit `driver-location`. The server immediately updates the database and broadcasts the location to:
     - The `admin-map` room (for admins).
     - Individual user sockets observing that driver via `live-driver-location`.
   - **Ride Notifications:** Uses custom utility functions (`notifyAdmin`, `notifyDriver`, `notifyUser`) to bridge REST API actions (e.g., a booking was created) with targeted Socket.io events.

### How to Add a New Feature
1. Create a `Model` if a new database collection is required.
2. Build the `Controller` containing your business logic.
3. Link the controller to a specific path in a `Route` file.
4. Mount the route file in `index.js`.
5. If the feature requires real-time updates, add the necessary `socket.on(...)` listener or `io.emit(...)` publisher inside `index.js` or through a dedicated service.

---
**Maintained by:** ScaleOrange Development Team
