import axios from "axios";
import React, { useState, useEffect } from "react";
import { Car, MapPin, Check, Shield, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapComponent from "../components/MapComponent";
import { useContext } from "react";
import MapContext from "../context/MapContext";
const HomePage = () => {
  
  const {apiUrl} = useContext(MapContext);
  

  const { destLocation } = useContext(MapContext);
  const [userLocation, setUserLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  // const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("standard");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [destAdd, setDestAdd] = useState("");
  const [disableMap, setDisableMap] = useState(false);
  const navigate = useNavigate();
  // Get user's current location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(location);
        try {
          const response = await axios.post(
            `${apiUrl}/api/get-address`,
            { lat: location.lat, lon: location.lng }
          );
          console.log(response.data.address);

          setPickupLocation(response.data.address);
        } catch (error) {}

        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !destAdd) {
      alert("Please provide both pickup and destination locations");
      return;
    }
    try {
      const response = await axios.post(
        "${apiUrl}/bookings/new",
        {
          userAddress: pickupLocation,
          source: userLocation,
          destination: { lat: destLocation.lat, lng: destLocation.lng },
          address: destAdd,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(response);
      if (response.status === 200)
        navigate(`/booking/${response.data.details.bookingId}`);
    } catch (error) {
      console.log("Error in booking the raid :", error);
    }
  };

  const handleDestinationClick = async (location) => {
    setDestAdd("Fetching destination address...");
    console.log(location);
    setDisableMap(true);
    try {
      const response = await axios.post(
        "${apiUrl}/api/get-address",
        { lat: location.lat, lon: location.lng }
      );
      console.log(response);
      setDestAdd(response.data.address);
      setDisableMap(false);
    } catch (error) {
      console.log("Error in handleDestination ", error);
      setDisableMap(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">RideEasy</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 font-medium">
                Your Trips
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Booking Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Book Your Ride
              </h2>

              {/* Location Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        userLocation ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {isLoadingLocation
                        ? "Getting location..."
                        : userLocation
                        ? "Location found"
                        : "Location needed"}
                    </span>
                  </div>

                  {!userLocation && (
                    <button
                      onClick={getUserLocation}
                      disabled={isLoadingLocation}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    >
                      {isLoadingLocation ? "Loading..." : "Enable Location"}
                    </button>
                  )}
                </div>

                {locationError && (
                  <p className="text-red-600 text-sm mt-2">{locationError}</p>
                )}
              </div>

              {/* Pickup Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-green-500" />
                  </div>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter pickup location"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where to? Pin in the Map...
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-red-500" />
                  </div>
                  <input
                    type="text"
                    value={destAdd}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      // console.log(destination)
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter destination"
                  />
                </div>
              </div>

              {/* Book Ride Button */}
              <button
                onClick={handleBookRide}
                disabled={!userLocation || !pickupLocation || !destAdd}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Order Ride
              </button>
            </div>
          </div>

          {/* Right Side - Map Area & Features */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            {userLocation ? (
              <MapComponent
                latitude={userLocation?.lat.toFixed(4)}
                longitude={userLocation?.lng.toFixed(4)}
                handleDestinationClick={handleDestinationClick}
                disableMap={disableMap}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">Interactive Map</p>
                  <p className="text-sm text-gray-500">
                    {userLocation
                      ? `Your location: ${userLocation.lat.toFixed(
                          4
                        )}, ${userLocation.lng.toFixed(4)}`
                      : "Enable location to see map"}
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why Choose RideEasy?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Real-time Tracking
                    </h4>
                    <p className="text-sm text-gray-600">
                      Track your ride in real-time from pickup to destination
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Safe & Secure</h4>
                    <p className="text-sm text-gray-600">
                      All drivers are verified and vehicles are regularly
                      inspected
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">24/7 Support</h4>
                    <p className="text-sm text-gray-600">
                      Get help anytime, anywhere with our dedicated support team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ride Options Modal */}
        {showRideOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirm Your Ride
                </h3>
                <p className="text-gray-600">Review your booking details</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium text-gray-900">
                    {pickupLocation.substring(0, 30)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium text-gray-900">
                    {destination.substring(0, 30)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ride Type:</span>
                  <span className="font-medium text-gray-900">
                    {rideTypes.find((type) => type.id === rideType)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Estimated Fare:</span>
                  <span className="font-bold text-gray-900">
                    ${estimatedFare}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
