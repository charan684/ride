import { React, useContext } from "react";
import { Navigate } from "react-router-dom";
import MapContext from "../context/AppContext";

const ProtectedRoute = ({ children, forUser = "user" }) => {
  const { user, loading } = useContext(MapContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  const isAuthenticated = () => {
    return forUser === user?.role;
  };

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
