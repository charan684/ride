import React, { useEffect, useState, useContext } from "react";
import socketInstance from "../../services/socketService";
import axios from "axios";
import MapContext from "../../context/AppContext";

const AdminRidesManager = () => {
  const { apiUrl } = useContext(MapContext);

  const [rideRequests, setRideRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState({});

  // Fetch pending ride requests
  const fetchRequestedRides = async () => {
    try {
      const res = await axios.get(`${apiUrl}/bookings/requested`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const rides = res.data
        .map((ride) => ({
          booking: { _id: ride._id, ...ride },
          locations: ride.locations,
        }))
        .sort(
          (a, b) =>
            new Date(b.booking.createdAt) - new Date(a.booking.createdAt)
        );
      setRideRequests(rides);
    } catch (err) {
      console.error("Error fetching requested rides:", err);
    }
  };

  // Fetch currently active drivers
  const fetchActiveDrivers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/active-riders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const activeDrivers = res.data.map((drv) => ({
        driverId: drv._id,
        username: drv.username,
        location: drv.location,
        status: "free",
      }));
      setDrivers(activeDrivers);
    } catch (err) {
      console.error("Error fetching active drivers:", err);
    }
  };

  // Initialize data and socket listeners
  useEffect(() => {
    fetchRequestedRides();
    fetchActiveDrivers();

    const socket = socketInstance.getSocket("admin");

    socket.on("new_ride_request", (data) => {
      setRideRequests((prev) => [
        { booking: { _id: data._id, ...data }, locations: data.locations },
        ...prev,
      ]);
    });

    socket.on("new-driver", (driver) => {
      setDrivers((prev) => {
        if (prev.some((d) => d.driverId === driver._id)) return prev;
        return [
          ...prev,
          {
            driverId: driver._id,
            username: driver.username,
            location: driver.location,
            status: "free",
          },
        ];
      });
    });

    socket.on("driver-location", ({ location, riderId, username }) => {
      setDrivers((prev) => {
        const exists = prev.find((d) => d.driverId === riderId);
        if (exists) {
          return prev.map((d) =>
            d.driverId === riderId
              ? { ...d, location, status: "free", username: d.username || username }
              : d
          );
        }
        return [
          ...prev,
          { driverId: riderId, location, username, status: "free" },
        ];
      });
    });

    socket.on("driver-disconnected", (driverId) => {
      setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
    });

    return () => {
      socket.off("new_ride_request");
      socket.off("new-driver");
      socket.off("driver-location");
      socket.off("driver-disconnected");
    };
  }, []);

  // Assign selected driver to a ride
  const assignDriver = async (rideId) => {
    const driverId = selectedDrivers[rideId];
    if (!driverId) {
      return alert("Please select a driver.");
    }
    try {
      const res = await axios.post(
        `${apiUrl}/bookings/assignDriver/${rideId}`,
        { driverId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(`Driver ${res.data.driver.username} assigned to Ride ${rideId}`);
      // Update UI state
      setDrivers((prev) =>
        prev.map((d) =>
          d.driverId === driverId ? { ...d, status: "assigned" } : d
        )
      );
      setRideRequests((prev) => prev.filter((r) => r.booking._id !== rideId));
      setSelectedDrivers((prev) => {
        const updated = { ...prev };
        delete updated[rideId];
        return updated;
      });
    } catch (err) {
      console.error("Assignment failed:", err);
      alert("Driver assignment failed.");
    }
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        Live Ride Requests
      </h2>

      {rideRequests.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No new ride requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {rideRequests.map(({ booking, locations }) => (
            <div
              key={booking._id}
              className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Ride ID:
                </span>
                <span className="text-blue-600 font-mono">
                  {booking._id}
                </span>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Stops:</span>{" "}
                  {locations
                    .map(
                      (loc, i) =>
                        `#${i + 1} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`
                    )
                    .join(" → ")}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <label
                    htmlFor={`driver-select-${booking._id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Assign Driver
                  </label>
                  <select
                    id={`driver-select-${booking._id}`}
                    value={selectedDrivers[booking._id] || ""}
                    onChange={(e) =>
                      setSelectedDrivers((prev) => ({
                        ...prev,
                        [booking._id]: e.target.value,
                      }))
                    }
                    className="w-full sm:w-auto border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>
                      Select a driver
                    </option>
                    {drivers
                      .filter((d) => d.status === "free")
                      .map((driver) => (
                        <option key={driver.driverId} value={driver.driverId}>
                          {driver.username || "Unnamed"} —{" "}
                          {driver.location
                            ? `${driver.location.lat}, ${driver.location.lng}`
                            : "No location"}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={() => assignDriver(booking._id)}
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRidesManager;
