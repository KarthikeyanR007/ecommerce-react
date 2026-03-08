import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
}

const Sidebar = ({ collapsed, toggleSidebar, onLogout }: SidebarProps) => {
  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/users" },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package, path: "/products" },
    { id: "categories", label: "Categories", icon: LayoutGrid, path: "/categories" },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">A</div>
          {!collapsed && <span className="logo-text">AdminUI</span>}
        </div>
        <button className="collapse-btn" type="button" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="sidebar-search">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          {!collapsed && <input type="text" placeholder="Search..." className="search-input" />}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) =>
          item.path ? (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className="nav-icon" />
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {isActive && !collapsed && <div className="active-indicator" />}
                </>
              )}
            </NavLink>
          ) : (
            <div key={item.id} className="nav-item nav-item-disabled" aria-disabled="true">
              <item.icon size={20} className="nav-icon" />
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </div>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">JD</div>
          {!collapsed && (
            <div className="user-details">
              <span className="user-name">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
          )}
        </div>
        <button className="logout-btn" type="button" onClick={onLogout}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
