import React from 'react';
import { useContext } from 'react';
import MapContext from '../context/AppContext';
import {useNavigation} from 'react-router-dom'
const ProfilePage = () => {
    const {user}=useContext(MapContext);
    // const navigate =useNavigation()
  const handleLogout = () => {
    // alert("Logged out");
    try {
      localStorage.removeItem("token")
      // navigate('/login')
    } catch (error) {
      console.log("Error in handleing in logout in profile page :" ,error)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {/* <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <img src="/logo.png" alt="Ride Logo" className="h-10" />
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit Profile
        </button>
      </header> */}

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <img
            src={user.avatarUrl}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">
            {user.username}
          </h1>
          <ul className="text-gray-600 mb-6 space-y-2 text-left">
            <li>
              <span className="font-medium">Email:</span> {user.email}
            </li>
            <li>
              <span className="font-medium">Phone:</span> {user.phone}
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <a href="/help" className="hover:underline mx-2">Help</a>
        <a href="/terms" className="hover:underline mx-2">Terms</a>
        <a href="/privacy" className="hover:underline mx-2">Privacy</a>
      </footer>
    </div>
  );
};

export default ProfilePage;
