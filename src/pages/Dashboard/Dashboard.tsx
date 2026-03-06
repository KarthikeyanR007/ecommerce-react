import Card from "../../components/Card/Card";
import {
  BarChart3,
  DollarSign,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Dashboard.css";

type Trend = "up" | "down";

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: Trend;
  icon: LucideIcon;
  color: string;
}

const Dashboard = () => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const stats: Stat[] = [
    {
      title: "Total Sales",
      value: "$18,920",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Orders",
      value: "1,248",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Customers",
      value: "842",
      change: "+5.7%",
      trend: "up",
      icon: Users,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Products",
      value: "316",
      change: "-2.3%",
      trend: "down",
      icon: Package,
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  const activities = [
    { text: "New order received from John Doe", time: "2 minutes ago", type: "order" },
    { text: "New customer registered", time: "15 minutes ago", type: "customer" },
    { text: "Product inventory updated", time: "1 hour ago", type: "product" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="greeting">{greeting()}, Admin</h1>
          <p className="date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="header-badge">
          <span className="badge-label">Overall Performance</span>
          <span className="badge-value">
            <TrendingUp size={16} />
            23.5%
          </span>
        </div>
      </div>

      <h2 className="section-title">Dashboard Overview</h2>

      <div className="cards-grid">
        {stats.map((stat, index) => (
          <Card
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="dashboard-widgets">
        <div className="widget activity-widget">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-dot ${activity.type}`} />
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget actions-widget">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" type="button">
              <span className="action-icon">
                <Plus size={18} />
              </span>
              <span className="action-label">Add Product</span>
            </button>
            <button className="action-btn" type="button">
              <span className="action-icon">
                <ShoppingCart size={18} />
              </span>
              <span className="action-label">View Orders</span>
            </button>
            <button className="action-btn" type="button">
              <span className="action-icon">
                <Users size={18} />
              </span>
              <span className="action-label">Manage Users</span>
            </button>
            <button className="action-btn" type="button">
              <span className="action-icon">
                <BarChart3 size={18} />
              </span>
              <span className="action-label">Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
