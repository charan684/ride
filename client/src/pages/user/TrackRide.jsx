import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../../context/AppContext";
import axios from "axios";
import MapComponent from "./MapComponentForTrack";
import socketInstance from "../../services/socketService";
const TrackRide = () => {
  const { id } = useParams();
  const { apiUrl } = useContext(AppContext);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [riderLocation, setRiderLocation] = useState(null);
  const getRideDetails = async () => {
    try {
      setLoading(true);
      console.log("Getting ride details...");
      const response = await axios.get(`${apiUrl}/bookings/ride-details/${id}`);
      console.log(response.data);
      setRide(response.data); // Adjust if your API shape is different
      setRiderLocation(response.data.riderDetails.location); // Adjust if your API shape is different
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch ride details.");
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    getRideDetails();
    const socket = socketInstance.getSocket("user");
    socket.on("rider-location", (data) => {
      const {location} = data;
      console.log("Received new location:", location);
      setRiderLocation(location);
      // Update the ride's location in the state or update the map accordingly
    });

    return () => socket.off("rider-location");
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-semibold">
        Loading ride details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (!ride) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="max-w-xl ml-10 mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">
          Track Your Ride
        </h2>
        <div className="mb-4">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="ml-2 text-green-600 capitalize">
              {ride.booking.status}
            </span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Booked At:</span>
            <span className="ml-2 text-gray-600">
              {new Date(ride.booking.bookedAt).toLocaleString()}
            </span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Pickup:</span>
            <span className="ml-2 text-gray-600">
              {ride.booking.pickupLocation?.address}
            </span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Destination:</span>
            <span className="ml-2 text-gray-600">
              {ride.booking.destination?.address}
            </span>
          </div>
        </div>

        {ride.riderDetails && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Driver Details</h3>
            <div>
              <span className="text-gray-700">Name:</span>
              <span className="ml-2 text-gray-600">
                {ride.riderDetails.username}
              </span>
            </div>
            <div>
              <span className="text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-600">
                {ride.riderDetails.phone}
              </span>
            </div>
            <div>
              <span className="text-gray-700">Email:</span>
              <span className="ml-2 text-gray-600">
                {ride.riderDetails.email}
              </span>
            </div>
          </div>
        )}
      </div>
      <MapComponent
        pickupLocation={ride.booking.pickupLocation}
        riderLocation={riderLocation}
      />
    </div>
  );
};

export default TrackRide;
