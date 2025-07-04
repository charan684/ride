import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import socketInstance from "../../services/socketService";

const statusStyles = {
  requested: "bg-indigo-100 text-indigo-800 border-indigo-200",
  assigned: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabel = (status) => status.replace("_", " ").toUpperCase();

const UserRides = ({ userId }) => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = useContext(AppContext);
  const token = localStorage.getItem("token");
  const [driverLocation, setDriverLocation] = useState(null);

  // Track Navigation handler
  const handleTrackLocation = async (ride) => {
    try {
      const response = await getRideDetails(ride._id);
      console.log(response)
      const driverLoc = response.riderDetails.location;
      setDriverLocation(driverLoc);
      const customerLat = ride.destination?.coordinates?.lat || 17.263;
      const customerLng = ride.destination?.coordinates?.lng || 78.233;
      // const url = `/Navigation.html?driverLat=${driverLoc.lat}&driverLng=${driverLoc.lng}&customerLat=${customerLat}&customerLng=${customerLng}`;
      // window.open(url, "_blank");
      navigate(`/track-ride/${ride._id}`, {
        state: {
          userLocation: { lat: customerLat, lng: customerLng },
          driverLocation: { lat: driverLoc.lat, lng: driverLoc.lng },
        },
      });
    } catch (err) {
      console.log(err);
      // alert("Unable to fetch driver location.");
    }
  };
  // Fetch ride details

  const getRideDetails = async (id) => {
    try {
      console.log("Getting ride details...");
      console.log(id);
      const response = await axios.get(`${apiUrl}/bookings/ride-details/${id}`);
      console.log(response.data);
      return response.data;
    } catch (err) {
      // setError("Failed to fetch ride details.");
      setLoading(false);
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await axios.get(`${apiUrl}/user/my-rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data)
        setRides(res.data);
      } catch (err) {
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
    const socket = socketInstance.getSocket("user");
    socket.on("ride-complete", (data) => {
      const {rideId} = data;
      const updatedRides = rides.map((ride) => {
        if (ride._id === rideId) {
          return { ...ride, status: "completed" };
        }
        return ride;
      });
      setRides(updatedRides);
  })
    
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600 text-lg font-medium">
          Loading your rides...
        </span>
      </div>
    );
  }

  if (!rides.length) {
    return (
      <div className="w-full max-w-xl mx-auto mt-16 p-8 bg-white rounded-xl shadow text-center text-gray-500 text-lg font-semibold">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076508.png"
          alt="No rides"
          className="w-20 h-20 mx-auto mb-4 opacity-60"
        />
        No rides found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 p-4 sm:p-6 bg-gray-50 rounded-xl shadow">
      <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center tracking-tight">
        Your Rides
      </h2>
      <ul className="space-y-7">
        {[...rides].reverse().map((ride) => (
          <li
            key={ride._id}
            className="relative w-full bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col gap-4 border border-gray-100"
          >
            {/* Status badge */}
            <span
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${
                statusStyles[ride.status]
              }`}
            >
              {statusLabel(ride.status)}
            </span>

            {/* Ride info */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-semibold text-gray-900">Pickup:</span>
                  <span className="ml-2 text-gray-700">
                    {/* {ride.pickupLocation?.address || "N/A"} */}
                    {ride?.locations[0]?.lat},{ride?.locations[0]?.lng}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-900">
                    Destination:
                  </span>
                  <span className="ml-2 text-gray-700">
                    {/* {ride.destination?.address || "N/A"}
                     */}
                     {ride?.locations[0]?.lat},{ride?.locations[0]?.lng}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-900">
                    Booked At:
                  </span>
                  <span className="ml-2 text-gray-700">
                    {new Date(ride.bookedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {ride.riderDetails && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900">Driver:</span>
                    <span className="ml-2 text-gray-700">
                      {ride.riderDetails.name || "Assigned"}
                    </span>
                  </div>
                )}
              </div>

              {/* Track Navigation */}
              {ride.status === "assigned" && (
                <div className="flex items-center">
                  <button
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                    onClick={() => handleTrackLocation(ride)}
                  >
                    Track Navigation
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRides;
