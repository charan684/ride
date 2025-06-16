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
import UserProfilePage from './pages/Profile.jsx'
const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/admin/" element={<AdminHome />} />
        <Route path="/booking/:id" element={<RideBookingLoading />} />
        <Route path="/my-rides" element={<UserRides />} />
        <Route path="/success" element={<RideBookingSuccess />} />
        <Route path="/ride/:id" element={<TrackRide />} />
      </Routes>
    </>
  );
};

export default App;
