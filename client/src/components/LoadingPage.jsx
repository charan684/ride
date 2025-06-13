import React from "react";
import Lottie from "react-lottie";
import riderAnimation from "./animations/rider.json"; // adjust path as needed
import socketInstance from "../services/socketService"
import { useEffect } from "react";
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: riderAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function RideBookingLoading() {
  useEffect(() => {
    const socket = socketInstance.getSocket("user");
    socket.on("ride-booked", (rideId) => {
      console.log("Ride booked successfully", rideId);
      // Navigate to the ride details page or update the app state accordingly
    });
    socket.on("ride-booking-cancelled", (rideId) => {
      console.log("Ride booking cancelled", rideId);
      // Navigate to the home page or update the app state accordingly
    });
    return () => socket.off("ride-booked");
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="w-56 h-56">
        <Lottie options={defaultOptions} height={220} width={220} />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-purple-700 animate-pulse">
        Booking your ride...
      </h2>
      <p className="mt-2 text-gray-600">Please wait while we process your request.</p>
    </div>
  );
}
