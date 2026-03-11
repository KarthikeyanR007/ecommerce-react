import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { api } from "../../services/api";

type Trend = "up" | "down";

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: Trend;
  icon: LucideIcon;
  color: string;
}

interface Activity {
  text: string;
  time: string;
  type: "order" | "customer" | "product";
}

interface DashboardStats {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  sales_change?: number;
  orders_change?: number;
  customers_change?: number;
  products_change?: number;
}

interface RecentOrder {
  user_order_id: string;
  user_name?: string;
  created_at: string;
  total_amount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData]       = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading]           = useState(true);

  // ── Fetch dashboard stats ──────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch stats and recent orders in parallel
        const [statsRes, ordersRes] = await Promise.allSettled([
          api.get("dashboard/stats"),
          api.get("orders/getall?page=1&per_page=3"),
        ]);

        // Stats
        if (statsRes.status === "fulfilled") {
          setStatsData(statsRes.value.data?.data ?? statsRes.value.data);
        }

        // Recent orders → map to activities
        if (ordersRes.status === "fulfilled") {
          const body = ordersRes.value.data;
          const isNested =
            body.data !== null &&
            typeof body.data === "object" &&
            !Array.isArray(body.data) &&
            "data" in body.data;
          const orders: RecentOrder[] = isNested
            ? body.data.data
            : body.data ?? [];
          setRecentOrders(orders.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const formatChange = (val?: number): { label: string; trend: Trend } => {
    if (val === undefined || val === null) return { label: "—", trend: "up" };
    return {
      label: `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`,
      trend: val >= 0 ? "up" : "down",
    };
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins < 1)   return "Just now";
    if (mins < 60)  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  // ── Build stats array ─────────────────────────────────────────────────
  const salesChange    = formatChange(statsData?.sales_change);
  const ordersChange   = formatChange(statsData?.orders_change);
  const custChange     = formatChange(statsData?.customers_change);
  const productsChange = formatChange(statsData?.products_change);

  const stats: Stat[] = [
    {
      title: "Total Sales",
      value: loading ? "—" : formatCurrency(statsData?.total_sales ?? 0),
      change: salesChange.label,
      trend:  salesChange.trend,
      icon:   DollarSign,
      color:  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Orders",
      value: loading ? "—" : String(statsData?.total_orders ?? 0),
      change: ordersChange.label,
      trend:  ordersChange.trend,
      icon:   ShoppingCart,
      color:  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Customers",
      value: loading ? "—" : String(statsData?.total_customers ?? 0),
      change: custChange.label,
      trend:  custChange.trend,
      icon:   Users,
      color:  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Products",
      value: loading ? "—" : String(statsData?.total_products ?? 0),
      change: productsChange.label,
      trend:  productsChange.trend,
      icon:   Package,
      color:  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  // ── Build activities from real orders ─────────────────────────────────
  const activities: Activity[] = recentOrders.length > 0
    ? recentOrders.map(o => ({
        text: `New order #${o.user_order_id} received${o.user_name ? ` from ${o.user_name}` : ""}`,
        time: timeAgo(o.created_at),
        type: "order" as const,
      }))
    : [
        { text: "No recent activity", time: "", type: "order" as const },
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
            {loading ? "…" : `${formatChange(statsData?.sales_change).label}`}
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
        {/* Recent Activity */}
        <div className="widget activity-widget">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {loading ? (
              <div className="dash-loading">Loading activity…</div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-dot ${activity.type}`} />
                  <div className="activity-content">
                    <p className="activity-text">{activity.text}</p>
                    {activity.time && (
                      <span className="activity-time">{activity.time}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="widget actions-widget">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button
              className="quick-action quick-action-add"
              type="button"
              onClick={() => navigate("/products/create")}
            >
              <span className="quick-action-icon"><Plus size={18} /></span>
              <span className="quick-action-label">
                <span className="quick-action-title">Add</span>
                <span className="quick-action-subtitle">Product</span>
              </span>
            </button>

            <button
              className="quick-action quick-action-orders"
              type="button"
              onClick={() => navigate("/orders")}
            >
              <span className="quick-action-icon"><ShoppingCart size={18} /></span>
              <span className="quick-action-label">
                <span className="quick-action-title">View</span>
                <span className="quick-action-subtitle">Orders</span>
              </span>
            </button>

            <button
              className="quick-action quick-action-users"
              type="button"
              onClick={() => navigate("/users")}
            >
              <span className="quick-action-icon"><Users size={18} /></span>
              <span className="quick-action-label">
                <span className="quick-action-title">Manage</span>
                <span className="quick-action-subtitle">Users</span>
              </span>
            </button>

            <button
              className="quick-action quick-action-report"
              type="button"
              onClick={() => navigate("/analytics")}
            >
              <span className="quick-action-icon"><BarChart3 size={18} /></span>
              <span className="quick-action-label">
                <span className="quick-action-title">Generate</span>
                <span className="quick-action-subtitle">Report</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;