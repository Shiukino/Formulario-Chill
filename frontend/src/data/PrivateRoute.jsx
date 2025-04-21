import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return element;
};

export default PrivateRoute;
