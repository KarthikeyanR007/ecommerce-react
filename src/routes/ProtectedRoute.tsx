import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "../services/authStorage";

const ProtectedRoute = () => {
  const location = useLocation();

  if (!getAuthToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
