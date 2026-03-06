import type { ComponentType } from "react";
import "./Card.css";

interface CardProps {
  title: string;
  value: string;
  icon?: ComponentType<{ className?: string; size?: number }>;
  color?: string;
  change?: string;
  trend?: "up" | "down";
}

const Card = ({ title, value, icon: Icon, color, change, trend }: CardProps) => {
  return (
    <div className="card" style={{ background: color }}>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {Icon && <Icon className="card-icon" size={24} />}
        </div>
        <div className="card-body">
          <span className="card-value">{value}</span>
          {change && trend && (
            <span className={`card-change ${trend}`}>
              {trend === "up" ? "^" : "v"} {change}
            </span>
          )}
        </div>
      </div>
      <div className="card-overlay"></div>
    </div>
  );
};

export default Card;
