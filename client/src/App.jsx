import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";
import RideBookingLoading from "./components/LoadingPage.jsx";
import UserRides from "./pages/user/UserRides.jsx";
import Navbar from './components/Navbar.jsx'
import RideBookingSuccess from './components/RideBookingSuccess.jsx'
import TrackRide from './pages/user/TrackRide.jsx'
import UserProfilePage from './pages/Profile.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TrackLocationMap from "./pages/user/TrackLocation.jsx";
import { Toaster } from'react-hot-toast';
const App = () => {
  return (
    <>
    <div><Toaster/></div>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute forUser="user"><Home /></ProtectedRoute>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/admin/" element={<ProtectedRoute forUser="admin"><AdminHome /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute><RideBookingLoading /></ProtectedRoute>} />
        <Route path="/my-rides" element={<ProtectedRoute><UserRides /></ProtectedRoute>} />
        <Route path="/success" element={<RideBookingSuccess />} />
        <Route path="/track-ride/:id" element={<ProtectedRoute><TrackRide /></ProtectedRoute>} />
        
      </Routes>
    </>
  );
};

export default App;
