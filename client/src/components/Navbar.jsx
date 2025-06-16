import { Car, LogOut, Menu } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContext from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user ,setUser} = useContext(MapContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RideEasy</h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => navigate('/my-rides')}
            >
              Your Rides
            </button>

            {user? (
              <>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-100 border border-red-200"
                >
                  <div className="flex flex-row items-center space-x-2">
                    <LogOut size={16} color="#DC2626" />
                    <span className="font-medium text-red-700">Logout</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2">
            <button
              className="block w-full text-left text-gray-700 px-2 py-1"
              onClick={() => {
                navigate('/my-rides');
                setMenuOpen(false);
              }}
            >
              Your Rides
            </button>

            {user ? (
              <>
                <button
                  className="block w-full text-left text-gray-700 px-2 py-1"
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left text-red-700 px-2 py-1"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="block w-full text-left text-blue-600 px-2 py-1"
                  onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="block w-full text-left text-blue-600 px-2 py-1"
                  onClick={() => {
                    navigate('/signup');
                    setMenuOpen(false);
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
