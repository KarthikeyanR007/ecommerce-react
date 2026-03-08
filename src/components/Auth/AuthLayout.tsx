import { type ReactNode } from "react";
import "./styles/auth.css";
// import leaf from "../assets/leaf.jpg";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-left">{children}</div>

      <div className="auth-right">
        <img 
          src="https://as1.ftcdn.net/v2/jpg/06/11/24/66/1000_F_611246646_AG50BIrYvobgrcTGHLOOnRRRzypsLBId.webp"
          alt="leaf" />
      </div>
    </div>
  );
};

export default AuthLayout;