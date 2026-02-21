# Ride Tracking System - Client Documentation

Welcome to the frontend application for the Ride Tracking System. This document contains everything you need to know from the product's perspective, how to configure the app locally, and a technical guide to understanding the code.

## 📖 Product Overview

The client application is a responsive, web-based platform tailored for three primary user personas:
1. **Users/Riders:** Allows users to book rides, track their driver's live location on a map, and manage their ride history.
2. **Drivers:** (Interacted via mobile or specific sub-views) Broadcasts their live coordinates to the server and accepts rides.
3. **Administrators:** A robust dashboard featuring an "Admin Map" to get a bird's-eye view of all active drivers and manage total ride requests in real-time.

**Key Features:**
- **Live Maps:** Uses Leaflet mapped with OpenStreetMap to render smooth, custom maps.
- **Real-time Synchronization:** Built heavily on WebSockets ensuring instantaneous data updates without page reloads.
- **Animated UI:** Employs Lottie animations, Confetti dropping for ride success, and Tailwind CSS for modern, intuitive aesthetics.
- **Role-Based Access Control:** Secure routing components to ensure Admins and Users only see what they are authorized to view.

---

## 🚀 Setup & Installation Guide

Follow these steps to get the frontend React application running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/)
- Running instance of the `server` application (to provide API and WebSocket capabilities).

### 1. Install Dependencies
Navigate into the `client` folder and install the NPM packages:
```bash
npm install
```
*(Note: standard `npm` is configured. If using `yarn`, run `yarn install`.)*

### 2. Configure Environment Variables
If the project utilizes environmental variables for the backend URL, you can use `.env` files (e.g., `.env.local` or `.env`):
```env
VITE_API_BASE_URL=http://localhost:8001
VITE_SOCKET_URL=http://localhost:8001
```

### 3. Run the Development Server
```bash
npm run dev
```
Vite will serve the application, usually accessible at `http://localhost:5173`.

### 4. Build for Production
To bundle the application, run:
```bash
npm run build
```
You can preview the production build using `npm run preview`.

---

## 👩‍💻 Developer Manual (Codebase Walkthrough)

For developers looking to contribute, here is an executive summary of how the frontend architecture is wired.

### User Types & Creation Flow

The system supports three distinct personas:

1. **Users/Riders (`role: "user"`)**
   - **Creation Flow:** Registered via the **Sign Up** page (`/signup` route). This sends a request to the server's standard user signup endpoint.
   - **Access:** Has access to the main dashboard, ride booking form (`/user/home`), and ride tracking map (`/user/track`).

2. **Drivers (`role: "rider"`)**
   - **Creation Flow:** Registered via a specific driver registration view or endpoint (`/api/auth/driver-signup` on the backend). 
   - **Access:** Used primarily for broadcasting coordinates via WebSockets rather than distinct frontend portal views in this client repository.

3. **Administrators (`role: "admin"`)**
   - **Creation Flow:** There is **no signup form** for administrators to prevent unauthorized access. Admins must be manually created in the database (e.g., changing a user's `role` to `"admin"` directly in MongoDB).
   - **Access:** Unlocks the protected `/admin` routing group, granting access to `AdminHome`, `AdminRidesManager`, and the global `AdminMap`.

### Tech Stack
- **Framework:** React 19 + Vite
- **Routing:** React Router DOM (v7)
- **Styling:** Tailwind CSS (v4)
- **Maps:** `leaflet` and `react-leaflet`
- **Real-time:** `socket.io-client`
- **Notifications:** React Hot Toast

### Core Project Structure
```text
client/
├── public/         # Static assets bypass webpack
├── src/
│   ├── assets/     # Images, SVG, uncompiled styles
│   ├── components/ # Reusable UI pieces (Navbar, ProtectedRoute, Loading screens)
│   ├── context/    # React Context providers (SocketContext, AuthContext, etc.)
│   ├── pages/      # Route-level views categorized by domain
│   │   ├── admin/  # (AdminHome, AdminMap, AdminRidesManager)
│   │   ├── auth/   # (Login, SignUp)
│   │   └── user/   # (Home, TrackRide, UserRides)
│   ├── services/   # Helper files for API abstractions / formatting
│   ├── App.jsx     # Main Route configuration mapping pages to URLs
│   └── main.jsx    # React Root Render & Provider Wrapping
├── eslint.config.js# Linting definitions
├── package.json    # Project manifests
└── vite.config.js  # Compiler pipeline configuration
```

### Architectural Concepts

1. **Routing Strategy:**
   - Handled in `App.jsx`. 
   - Uses a custom `<ProtectedRoute>` component which checks the user's logged-in state and `role` (Admin vs. User) before rendering the children components. 
   
2. **WebSocket Integration:**
   - Real-time events (`live-driver-location`, `ride-booked`, `new_ride_request`) are handled within effect hooks or context providers.
   - For example, when an admin goes to `/admin-map`, the component mounts, connects to the `admin-map` socket room, and listens to plotting points dynamically rendered onto the Leaflet map state.

3. **Styling & Assets:**
   - Everything uses functional CSS utility classes via **Tailwind CSS**.
   - Global base styles are injected via `index.css`.

### Making Changes
- To **add a new page**: Build the page view in `src/pages/`, then add the routing logic in `App.jsx`. If it requires authentication, wrap it in `<ProtectedRoute>`.
- To **modify API calls**: Find or create the corresponding REST call format inside `src/services/` (if abstracted) or local components via `axios`, ensuring the `VITE_API_BASE_URL` logic is respected.
- To **add maps**: Study the `TrackRide.jsx` or `AdminMap.jsx` files for an example of integrating `MapContainer`, `TileLayer`, and `Marker` from `react-leaflet`.

---
**Maintained by:** ScaleOrange Development Team
