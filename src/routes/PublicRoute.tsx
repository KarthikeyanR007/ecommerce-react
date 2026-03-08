import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "../services/authStorage";

const PublicRoute = () => {
  if (getAuthToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
