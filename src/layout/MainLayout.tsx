import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Dashboard from "../pages/Dashboard/Dashboard";
import Users from "../pages/Users/Users";
import "./MainLayout.css";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        
        <div className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
          <Navbar toggleSidebar={toggleSidebar} />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            {/* Add other routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default MainLayout;
