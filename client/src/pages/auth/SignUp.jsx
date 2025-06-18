import React, { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { User, Lock, Mail, Phone } from "lucide-react";
import MapContext from "../../context/AppContext";
import {useNavigate} from "react-router-dom";
const SignupPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const {apiUrl,addToast} = useContext(MapContext);

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(formData)
    console.log(apiUrl)
    try {
      await axios.post(`${apiUrl}/api/auth/signup`, formData);
      addToast("Registration successful!","success"); 
      navigate("/login");
    } catch (error) {
      console.log("Signup error:", error);
      addToast("Error registering. Please try again.","error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join RideEasy</h2>
            <p className="text-gray-600">Create your account and start riding today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border rounded-lg shadow-sm border-gray-300 bg-white focus:outline-none focus:ring-2"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg shadow-sm border-gray-300 bg-white focus:outline-none focus:ring-2"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg shadow-sm border-gray-300 bg-white focus:outline-none focus:ring-2"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg shadow-sm border-gray-300 bg-white focus:outline-none focus:ring-2"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2"
              }`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to='/login' className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-bl from-green-500 via-blue-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <img
            src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=1000&q=80"
            alt="Hero"
            className="w-96 h-96 object-cover rounded-2xl shadow-2xl mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">Start Your Journey</h1>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of satisfied customers who trust RideEasy for their daily rides.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

