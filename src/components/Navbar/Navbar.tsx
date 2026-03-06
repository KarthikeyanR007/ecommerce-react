import { Bell, Menu, Sun } from "lucide-react";
import "./Navbar.css";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" type="button" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
      </div>

      <div className="navbar-right">
        <button className="theme-toggle" type="button" aria-label="Toggle theme">
          <Sun size={20} />
        </button>

        <button className="notification-btn" type="button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge" />
        </button>

        <div className="profile-section">
          <div className="profile-avatar">
            <img src="https://i.pravatar.cc/40?img=12" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
