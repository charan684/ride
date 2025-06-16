import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AppContext from "../../context/AppContext";
import { useNavigate } from 'react-router-dom';

const statusStyles = {
  requested: "bg-indigo-100 text-indigo-800",
  assigned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabel = (status) => {
  return status.replace('_', ' ').toUpperCase();
};

const UserRides = ({ userId }) => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl, user } = useContext(AppContext);
  const token = localStorage.getItem('token');
  const handleTrackLocation = async(rideId)=>{
    console.log("Tracking location ,",rideId);
    navigate(`/ride/${rideId}`);
  }

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await axios.get(`${apiUrl}/user/my-rides`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRides(res.data);
      } catch (err) {
        console.error('Failed to fetch rides', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow text-center text-gray-700 text-lg font-medium">
        Loading...
      </div>
    );
  }
  if (!rides.length) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow text-center text-gray-700 text-lg font-medium">
        No rides found.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-gray-50 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Rides</h2>
      <ul className="space-y-6">
        {rides.map(ride => (
          <li key={ride._id} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow">
            <span className={`inline-block px-3 py-1 mb-3 rounded-full text-sm font-semibold ${statusStyles[ride.status]}`}>
              {statusLabel(ride.status)}
            </span>
            <div className="mb-1">
              <span className="font-semibold text-black">Pickup:</span>
              <span className="ml-2 text-gray-800">{ride.pickupLocation?.address || "N/A"}</span>
            </div>
            <div className="mb-1">
              <span className="font-semibold text-black">Destination:</span>
              <span className="ml-2 text-gray-800">{ride.destination?.address || "N/A"}</span>
            </div>
            <div className="mb-1">
              <span className="font-semibold text-black">Booked At:</span>
              <span className="ml-2 text-gray-800">{new Date(ride.bookedAt).toLocaleString()}</span>
            </div>
            {
              ride.status === 'assigned' && (
                <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200' onClick={()=>handleTrackLocation(ride._id)}>Track Location</button>
              )
            }
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRides;
