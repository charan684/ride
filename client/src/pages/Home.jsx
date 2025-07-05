
import React, { useState, useEffect, useContext } from "react";  
import { MapPin, X } from "lucide-react";  
import axios from "axios";  
import MapComponent from "../components/MapComponent";  
import MapContext from "../context/AppContext";  
import AssignDriver from "./AssignRider";
import socketInstance from "../services/socketService";

const Home = () => {
  const { setDestLocation, apiUrl } = useContext(MapContext);  
  const [locations, setLocations] = useState([]);  
  const [currentLatitude, setCurrentLatitude] = useState("");  
  const [currentLongitude, setCurrentLongitude] = useState("");  
  const [booking, setBooking] = useState(null);  
  const [assignmentResult, setAssignmentResult] = useState(null);

  // Input validation for latitude and longitude
  const isValidLatitude = (lat) =>
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/.test(lat);  
  const isValidLongitude = (lng) =>
    /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(lng);

  // Add a new location to the list
  const addLocation = () => {
    if (
      currentLatitude &&
      currentLongitude &&
      isValidLatitude(currentLatitude) &&
      isValidLongitude(currentLongitude)
    ) {
      const newLocation = {
        id: Date.now(),
        lat: parseFloat(currentLatitude.trim()),
        lng: parseFloat(currentLongitude.trim()),
        visited: false
      };
      setLocations([...locations, newLocation]);  
      setCurrentLatitude("");  
      setCurrentLongitude("");  
    }
  };

  // Remove a location by its generated id
  const removeLocation = (id) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));  
  };

  // Submit booking and trigger nearest-driver assignment
  const handleSubmit = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/bookings/new`,
      locations.map(({ lat, lng, visited }) => ({ lat, lng, visited })),
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    const newBooking = response.data.newBooking;
    setBooking(newBooking);
    setDestLocation(locations);

    const socket = socketInstance.getSocket("user"); // 👈 get actual socket
    socket.emit("new_ride_request", {
      booking: newBooking,
      locations,
    });


    console.log("Booking created and sent to admin", newBooking);
  } catch (error) {
    console.error("Booking creation failed", error);
    alert("Failed to create booking");
  }
};


  // Callback from AssignDriver on assignment completion
  const handleAssigned = (driver) => {
    if (driver) {
      alert(`Assigned driver: ${driver.username}`);  
    } else {
      alert("No available drivers at this time");  
    }
    setAssignmentResult(driver);  
    setBooking(null);  
  };

  // Fetch initial available drivers for warm-up (optional)
  useEffect(() => {
    // This can pre-fetch or subscribe via socket if needed
    
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add Multiple Locations
              </h2>

              {/* Latitude Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={currentLatitude}
                  onChange={(e) => setCurrentLatitude(e.target.value)}
                  placeholder="Enter latitude (e.g., 12.9716)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    currentLatitude && !isValidLatitude(currentLatitude)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>

              {/* Longitude Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={currentLongitude}
                  onChange={(e) => setCurrentLongitude(e.target.value)}
                  placeholder="Enter longitude (e.g., 77.5946)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    currentLongitude && !isValidLongitude(currentLongitude)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>

              {/* Add Location Button */}
              <button
                onClick={addLocation}
                disabled={
                  !currentLatitude ||
                  !currentLongitude ||
                  !isValidLatitude(currentLatitude) ||
                  !isValidLongitude(currentLongitude)
                }
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Add Location
              </button>

              {/* Submit Booking Button */}
              <button
                onClick={handleSubmit}
                disabled={locations.length <= 1}
                className="w-full bg-blue-600 text-white py-3 px-6 mt-3 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Submit
              </button>

              {/* Added Locations List */}
              {locations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Added Locations ({locations.length})
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-sm">
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeLocation(location.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map */}
          <div className="space-y-6">
            <MapComponent
              locations={locations}
              handleLocationClick={(loc) => {
                console.log("Map click:", loc);
              }}
            />
          </div>
        </div>

        {/* AssignDriver for automatic nearest-driver assignment */}
        {/* {booking && (
          <AssignDriver booking={booking} onAssigned={handleAssigned} />
        )} */}

        {/* Display Assignment Result */}
        {assignmentResult !== null && (
          <div className="mt-6 text-center text-lg font-medium text-gray-800">
            {assignmentResult
              ? `Driver ${assignmentResult.username} assigned successfully.`
              : "Assignment failed or no drivers available."}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

