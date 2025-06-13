import React, { useState, useEffect } from 'react';
import socketInstance from '../../services/socketService';
const AdminDashboard = () => {
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [activeTab, setActiveTab] = useState('rides');

  // Mock data - replace with your API calls
  const handleNewRide = (ride)=>{
    console.log("New ride received: ", ride);
  }
  useEffect(() => {
    socketInstance.on("new-ride", handleNewRide);
    // Simulate fetching rides data
    setRides([
      {
        id: 'R001',
        userId: 'U123',
        userName: 'John Doe',
        userPhone: '+1 234-567-8900',
        pickup: 'Downtown Mall, 123 Main St',
        destination: 'Airport Terminal 1',
        pickupCoords: { lat: 40.7128, lng: -74.0060 },
        destCoords: { lat: 40.6892, lng: -74.1745 },
        rideType: 'standard',
        status: 'pending',
        fare: 24.50,
        distance: '12.5 km',
        requestTime: '2024-01-15T10:30:00Z',
        assignedDriver: null
      },
      {
        id: 'R002',
        userId: 'U124',
        userName: 'Sarah Wilson',
        userPhone: '+1 234-567-8901',
        pickup: 'Central Station',
        destination: '456 Oak Avenue',
        pickupCoords: { lat: 40.7589, lng: -73.9851 },
        destCoords: { lat: 40.7505, lng: -73.9934 },
        rideType: 'premium',
        status: 'assigned',
        fare: 18.75,
        distance: '8.2 km',
        requestTime: '2024-01-15T11:15:00Z',
        assignedDriver: 'D001'
      },
      {
        id: 'R003',
        userId: 'U125',
        userName: 'Mike Johnson',
        userPhone: '+1 234-567-8902',
        pickup: 'University Campus',
        destination: 'Shopping Center',
        pickupCoords: { lat: 40.7282, lng: -73.9942 },
        destCoords: { lat: 40.7410, lng: -73.9896 },
        rideType: 'shared',
        status: 'completed',
        fare: 12.25,
        distance: '5.1 km',
        requestTime: '2024-01-15T09:45:00Z',
        assignedDriver: 'D002'
      }
    ]);

    // Simulate fetching drivers data
    setDrivers([
      {
        id: 'D001',
        name: 'Alex Rodriguez',
        phone: '+1 234-567-9000',
        vehicle: 'Toyota Camry 2022',
        license: 'ABC123',
        rating: 4.8,
        status: 'busy',
        location: { lat: 40.7282, lng: -73.9942 },
        earnings: 145.50
      },
      {
        id: 'D002',
        name: 'Emily Chen',
        phone: '+1 234-567-9001',
        vehicle: 'Honda Accord 2023',
        license: 'DEF456',
        rating: 4.9,
        status: 'available',
        location: { lat: 40.7505, lng: -73.9934 },
        earnings: 198.75
      },
      {
        id: 'D003',
        name: 'David Brown',
        phone: '+1 234-567-9002',
        vehicle: 'BMW 3 Series 2021',
        license: 'GHI789',
        rating: 4.7,
        status: 'available',
        location: { lat: 40.7128, lng: -74.0060 },
        earnings: 167.25
      }
    ]);
    return () => socketInstance.off("new-ride", handleNewRide);
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearestDrivers = (rideCoords) => {
    const availableDrivers = drivers.filter(driver => driver.status === 'available');
    
    return availableDrivers
      .map(driver => ({
        ...driver,
        distance: calculateDistance(
          rideCoords.lat, rideCoords.lng,
          driver.location.lat, driver.location.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  const assignDriver = async (rideId, driverId) => {
    setIsAssigning(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRides(prevRides =>
      prevRides.map(ride =>
        ride.id === rideId
          ? { ...ride, status: 'assigned', assignedDriver: driverId }
          : ride
      )
    );
    
    setDrivers(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === driverId
          ? { ...driver, status: 'busy' }
          : driver
      )
    );
    
    setIsAssigning(false);
    setShowDriverModal(false);
    setSelectedRide(null);
  };

  const filteredRides = rides.filter(ride => {
    const matchesStatus = filterStatus === 'all' || ride.status === filterStatus;
    const matchesSearch = ride.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRideTypeIcon = (type) => {
    switch (type) {
      case 'shared': return '👥';
      case 'premium': return '🚙';
      default: return '🚗';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RideEasy Admin</h1>
                <p className="text-sm text-gray-600">Ride Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live Dashboard</span>
              </div>
              
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
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
                <p className="text-sm font-medium text-gray-600">Total Rides</p>
                <p className="text-3xl font-bold text-gray-900">{rides.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Rides</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {rides.filter(ride => ride.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-3xl font-bold text-green-600">
                  {drivers.filter(driver => driver.status === 'available').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${rides.reduce((sum, ride) => sum + ride.fare, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('rides')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rides'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ride Management
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drivers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Driver Management
              </button>
            </nav>
          </div>

          {activeTab === 'rides' && (
            <div className="p-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
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
              </div>

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
                    {filteredRides.map((ride) => (
                      <tr key={ride.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {ride.userName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{ride.userName}</div>
                              <div className="text-sm text-gray-500">{ride.userPhone}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(ride.requestTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              <span className="text-gray-900 truncate max-w-xs">{ride.pickup}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              <span className="text-gray-900 truncate max-w-xs">{ride.destination}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {getRideTypeIcon(ride.rideType)} {ride.distance}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ride.status)}`}>
                            {ride.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${ride.fare.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {ride.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setSelectedRide(ride);
                                setShowDriverModal(true);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                              Assign Driver
                            </button>
                          ) : (
                            <span className="text-gray-500">
                              {ride.assignedDriver ? `Driver: ${ride.assignedDriver}` : 'No action needed'}
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

          {activeTab === 'drivers' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((driver) => (
                  <div key={driver.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-blue-600">
                            {driver.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                          <p className="text-sm text-gray-600">{driver.phone}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">{driver.vehicle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">License:</span>
                        <span className="font-medium">{driver.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <span className="font-medium">{driver.rating}</span>
                          <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Earnings:</span>
                        <span className="font-medium text-green-600">${driver.earnings}</span>
                      </div>
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
                <h3 className="text-xl font-bold text-gray-900">Assign Driver to Ride</h3>
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Ride Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Customer:</span> {selectedRide.userName}</p>
                  <p><span className="font-medium">Pickup:</span> {selectedRide.pickup}</p>
                  <p><span className="font-medium">Destination:</span> {selectedRide.destination}</p>
                  <p><span className="font-medium">Fare:</span> ${selectedRide.fare.toFixed(2)}</p>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-4">Available Drivers (Sorted by Distance)</h4>
              <div className="space-y-3">
                {getNearestDrivers(selectedRide.pickupCoords).map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600">{driver.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{driver.name}</h5>
                        <p className="text-sm text-gray-600">{driver.vehicle}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">Rating: {driver.rating}</span>
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-500">Distance: {driver.distance.toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => assignDriver(selectedRide.id, driver.id)}
                      disabled={isAssigning}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
