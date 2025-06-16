import React, { useState, useEffect, useContext } from "react";
import socketInstance from "../../services/socketService";
import {
  CheckCircle,
  Circle,
  CircleUser,
  Clock,
  Search,
  Star,
  Wallet,
  X,
} from "lucide-react";
import axios from "axios";
import MapContext from "../../context/AppContext";
const AdminDashboard = () => {
  const { apiUrl } = useContext(MapContext);
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);

  const [isAssigning, setIsAssigning] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [activeTab, setActiveTab] = useState("rides");
  const [loading, setLoading] = useState(false);
  // Mock data - replace with your API calls
  const handleNewRide = (ride) => {
    console.log("New ride received: ", ride);
    setRides((prevRides) => [...prevRides, ride]);
  };
  const fetchBookings = async () => {
    setLoading(true);

    const bookings = await axios.get(`${apiUrl}/bookings`);
    console.log(bookings);
    
    setRides(bookings.data);
    setLoading(false);
  };

  const fetchAvailableDrivers = async () => {
    const drivers = await axios.get(`${apiUrl}/active-riders`);
    console.log(drivers);
    setDrivers(drivers.data);
  };
  const handleNewDriver = (driver) => {
    console.log("New driver received: ", driver);
    setDrivers((prevDrivers) => [...prevDrivers, driver]);
  };

  useEffect(() => {
    const socket = socketInstance.getSocket("admin");
    socket.on("new-ride", handleNewRide);

    socket.on("new-driver", handleNewDriver);
    socket.on("driver-disconnected", (driverId) => {
      const updatedDrivers = drivers.filter((d) => d.id!== driverId);
      setDrivers(updatedDrivers);
    });
    fetchBookings();

    fetchAvailableDrivers();
    // Simulate fetching drivers data
    return () => {
      socket.off("new-ride", handleNewRide);
      socket.off("new-driver", handleNewDriver);
    };
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearestDrivers = (rideCoords) => {
    const availableDrivers = drivers;

    return availableDrivers
      .map((driver) => ({
        ...driver,
        distance: calculateDistance(
          rideCoords.lat,
          rideCoords.lng,
          driver.location.lat,
          driver.location.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
    return drivers;
  };

  const assignDriver = async (rideId, driverId) => {
    setIsAssigning(true);
    console.log(rideId);
    if(!rideId){
      setIsAssigning(false);
      return;
    }
    const response = await axios.post(
      `${apiUrl}/bookings/assignDriver/${rideId}`,
      {
        driverId,
      }
    );
    console.log(response);
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    setRides((prevRides) =>
      prevRides.map((ride) =>
        ride.id === rideId
          ? { ...ride, status: "assigned", assignedDriver: driverId }
          : ride
      )
    );

    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) =>
        driver.id === driverId ? { ...driver, status: "busy" } : driver
      )
    );

    setIsAssigning(false);
    setShowDriverModal(false);
    setSelectedRide(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRideTypeIcon = (type) => {
    switch (type) {
      case "shared":
        return "👥";
      case "premium":
        return "🚙";
      default:
        return "🚗";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      RideEasy Admin
                    </h1>
                    <p className="text-sm text-gray-600">
                      Ride Management Dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      Live Dashboard
                    </span>
                  </div>

                  <button className="relative p-2 text-gray-600 hover:text-gray-900">
                    <CircleUser className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Rides
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {rides.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Circle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Rides
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {rides.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Drivers
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {drivers.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CircleUser className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    {/* <p className="text-3xl font-bold text-purple-600">
                      $
                      {rides
                        .reduce((sum, ride) => sum + ride.fare, 0)
                        .toFixed(2)}
                    </p> */}
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("rides")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "rides"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Ride Management
                  </button>
                  <button
                    onClick={() => setActiveTab("drivers")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "drivers"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Driver Management
                  </button>
                </nav>
              </div>

              {activeTab === "rides" && (
                <div className="p-6">
                  {/* Filters and Search */}
                  {/* <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Search rides by user, pickup, or destination..."
                        />
                      </div>
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div> */}

                  {/* Rides Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ride Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fare
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rides.map((ride) => (
                          <tr key={ride._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {/* {ride.userName.charAt(0)} */}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {ride.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {ride.userPhone}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(ride.bookedAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span className="text-gray-900 truncate max-w-xs">
                                    {ride.pickupLocation.address}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                  <span className="text-gray-900 truncate max-w-xs">
                                    {ride.destination.address}
                                  </span>
                                </div>
                                {/* <div className="text-xs text-gray-500">
                                  {getRideTypeIcon(ride.rideType)}{" "}
                                  {ride.distance}
                                </div> */}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  ride.status
                                )}`}
                              >
                                {ride.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${ride.fare}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {ride.status === "requested" ? (
                                <button
                                  onClick={() => {
                                    console.log(ride)
                                    setSelectedRide(ride);
                                    setShowDriverModal(true);
                                  }}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                  Assign Driver
                                </button>
                              ) : (
                                <span className="text-gray-500">
                                  {ride.assignedDriver
                                    ? `Driver: ${ride.assignedDriver}`
                                    : "No action needed"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "drivers" && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Driver Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                      <div
                        key={driver._id}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-medium text-blue-600">
                                {driver.username.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {driver.username}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {driver.phone}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full  "bg-green-100 text-green-800"
                               
                            }`}
                          >
                            {/* {driver.status} */}
                            available
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Vehicle:</span>
                            <span className="font-medium">
                              {/* {driver.vehicle} */}
                              Bike
                            </span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span className="text-gray-600">License:</span>
                            <span className="font-medium">
                              {driver.license}
                            </span>
                          </div> */}
                          {/* <div className="flex justify-between">
                            <span className="text-gray-600">Rating:</span>
                            <div className="flex items-center">
                              <span className="font-medium">
                                {driver.rating}
                              </span>
                              <Star className="w-4 h-4 text-yellow-400 ml-1" />
                            </div>
                          </div> */}
                          {/* <div className="flex justify-between">
                            <span className="text-gray-600">Earnings:</span>
                            <span className="font-medium text-green-600">
                              ${driver.earnings}
                            </span>
                          </div> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Assignment Modal */}
          {showDriverModal && selectedRide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      Assign Driver to Ride
                    </h3>
                    <button
                      onClick={() => setShowDriverModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Ride Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Customer:</span>{" "}
                        {selectedRide.userName}
                      </p>
                      <p>
                        <span className="font-medium">Pickup:</span>{" "}
                        {selectedRide.pickup}
                      </p>
                      <p>
                        <span className="font-medium">Destination:</span>{" "}
                        {selectedRide.destination.address}
                      </p>
                      <p>
                        <span className="font-medium">Fare:</span> $
                        {/* {selectedRide.fare.toFixed(2)} */}
                      </p>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-4">
                    Available Drivers (Sorted by Distance)
                  </h4>
                  <div className="space-y-3">
                    {getNearestDrivers(
                      selectedRide.pickupLocation.coordinates
                    ).map((driver) => (
                      <div
                        key={driver._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-blue-600">
                              {driver.username.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {driver.username}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {/* {driver.vehicle} */}
                              Bike
                            </p>
                            {/* <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-500">
                                  Rating: {driver.rating}
                                </span>
                                <span className="text-blue-600">•</span>
                                <span className="text-gray-500">
                                  Distance: {driver.distance.toFixed(1)} km
                                </span>
                              </div> */}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            console.log(selectedRide,driver);
                            assignDriver(selectedRide._id, driver._id);
                          }}
                          disabled={isAssigning}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                        >
                          {isAssigning ? "Assigning..." : "Assign"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
