import axios from "axios";
import React, { useState, useEffect } from "react";
import L from "leaflet";
import MapComponent from "../components/MapComponent";
import { useContext } from "react";
import MapContext from "../context/MapContext";
const HomePage = () => {
  const { destLocation } = useContext(MapContext);
  const [userLocation, setUserLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  // const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("standard");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [destAdd,setDestAdd]=useState("")

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
        const response = await axios.post(
          "http://localhost:8000/api/get-address",
          { lat: location.lat, lon: location.lng }
        );
        console.log(response.data.address);
        
        setPickupLocation(response.data.address);
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
      const response=await axios.post("http://localhost:8000/bookings/new",{source:pickupLocation,destination:destAdd},{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}})
      console.log(response)
    } catch (error) {
      console.log("Error in booking the raid :",error)
    }
    // try {
    //   const response = await axios.post(
    //     "http://localhost:8000/api/get-co-ord",
    //     { destination }
    //   );
    //   console.log(response);
    // } catch (error) {
    //   console.log("error in fetching co-ordinates of destination", error);
    // }
    // Calculate estimated fare (mock calculation)
    // const baseFare =
    //   rideType === "premium" ? 15 : rideType === "shared" ? 8 : 12;
    // const distance = Math.random() * 10 + 2; // Mock distance
    // const fare = (baseFare + distance * 2).toFixed(2);
    // setEstimatedFare(fare);
    // setShowRideOptions(true);
  };

  const confirmBooking = () => {
    // Here you would integrate with your backend API
    const bookingData = {
      pickup: pickupLocation,
      destination: destination,
      userLocation: userLocation,
      estimatedFare: estimatedFare,
      timestamp: new Date().toISOString(),
    };

    console.log("Booking confirmed:", bookingData);
    alert("Ride booked successfully! Finding nearby drivers...");

    // Reset form
    setShowRideOptions(false);
    setDestination("");
    setEstimatedFare(null);
  };
  const handleDestinationClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/get-address",
        { lat: destLocation.lat, lon: destLocation.lng }
      );
      console.log(response);
      setDestAdd(response.data.address)
    } catch (error) {
      console.log("Error in handleDestination ", error);
    }
  };
  // const rideTypes = [
  //   {
  //     id: "shared",
  //     name: "RideShare",
  //     description: "Share with others, save money",
  //     icon: "👥",
  //     multiplier: 0.8,
  //   },
  //   {
  //     id: "standard",
  //     name: "RideEasy",
  //     description: "Affordable, reliable rides",
  //     icon: "🚗",
  //     multiplier: 1.0,
  //   },
  //   {
  //     id: "premium",
  //     name: "RideLux",
  //     description: "Premium cars, top service",
  //     icon: "🚙",
  //     multiplier: 1.5,
  //   },
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                </svg>
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
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
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

              {/* Ride Type Selection */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Ride Type
                </label>
                <div className="space-y-3">
                  {rideTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rideType"
                        value={type.id}
                        checked={rideType === type.id}
                        onChange={(e) => setRideType(e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {type.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div> */}

              {/* Book Ride Button */}
              <button
                onClick={handleBookRide}
                disabled={!userLocation || !pickupLocation || !destAdd}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Order Ride
              </button>
            </div>

            {/* Recent Trips */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Trips
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Downtown → Airport
                      </p>
                      <p className="text-xs text-gray-500">
                        Yesterday, 3:45 PM
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    $24.50
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Mall → Home
                      </p>
                      <p className="text-xs text-gray-500">June 10, 8:20 PM</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    $18.75
                  </span>
                </div>
              </div>
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
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
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
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
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

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRideOptions(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Book Ride
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
