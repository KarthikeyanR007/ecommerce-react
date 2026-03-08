import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { clearAuthToken } from "../services/authStorage";
import "./MainLayout.css";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    clearAuthToken();
    toast.success("You have been signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      <div className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
