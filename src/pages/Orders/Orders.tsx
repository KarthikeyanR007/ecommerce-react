import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Search, Eye, ChevronLeft, ChevronRight,
  Clock, CheckCircle, XCircle, Truck, Package,
  CreditCard, Banknote, TrendingUp, Filter
} from "lucide-react";
import "./Orders.css";
import { api } from "../../services/api";

// ── Types ──────────────────────────────────────────────────────────────────
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
type OrderStatus   = "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  order_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  user_order_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  total_amount: number;
  delivery_date: string | null;
  order_delivery_address: string;
  delivery_boy_id: number | null;
  payment_status: PaymentStatus;
  order_status?: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface DeliveryBoy {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
}

// ── Config ─────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

const paymentConfig: Record<PaymentStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:  { label: "Pending",  icon: <Clock size={12} />,       cls: "status-pending"  },
  paid:     { label: "Paid",     icon: <CheckCircle size={12} />, cls: "status-paid"     },
  failed:   { label: "Failed",   icon: <XCircle size={12} />,     cls: "status-failed"   },
  refunded: { label: "Refunded", icon: <Banknote size={12} />,    cls: "status-refunded" },
};

const orderStatusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  processing: { label: "Processing", icon: <Package size={12} />,      cls: "ostatus-processing" },
  shipped:    { label: "Shipped",    icon: <Truck size={12} />,        cls: "ostatus-shipped"    },
  delivered:  { label: "Delivered",  icon: <CheckCircle size={12} />,  cls: "ostatus-delivered"  },
  cancelled:  { label: "Cancelled",  icon: <XCircle size={12} />,      cls: "ostatus-cancelled"  },
};

// ── Component ──────────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders]               = useState<Order[]>([]);
  const [deliveryBoys, setDeliveryBoys]   = useState<DeliveryBoy[]>([]);
  const [assigningOrderId, setAssigningOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [statusFilter, setStatusFilter]   = useState<"all" | OrderStatus>("all");
  const [currentPage, setCurrentPage]     = useState(1);
  const [lastPage, setLastPage]           = useState(1);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen]       = useState(false);

  // ── Fetch Orders ─────────────────────────────────────────────────────────
  const getOrdersList = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(
        `orders/getall?page=${page}&per_page=${PER_PAGE}`
      );
      const body = response.data;
      const isNested =
        body.data !== null &&
        typeof body.data === "object" &&
        !Array.isArray(body.data) &&
        "data" in body.data;

      const res = isNested ? body.data : body;
      setOrders(Array.isArray(res.data) ? res.data : []);
      setTotal(res.total ?? 0);
      setLastPage(res.last_page ?? 1);
      setCurrentPage(res.current_page ?? page);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Delivery Boys ───────────────────────────────────────────────────
  const getDeliveryBoys = useCallback(async () => {
    try {
      const res = await api.get("deliveryboy/getall?per_page=100");
      const body = res.data;
      setDeliveryBoys(body.data ?? []);
    } catch (error) {
      console.error("Failed to fetch delivery boys:", error);
    }
  }, []);

  useEffect(() => {
    getOrdersList(1);
    getDeliveryBoys();
  }, []);

  // ── Assign Delivery Boy ───────────────────────────────────────────────────
  const assignDeliveryBoy = async (orderId: number, deliveryBoyId: number) => {
    setAssigningOrderId(orderId);
    try {
      await api.post(`orders/assign-delivery-boy/${orderId}`, {
        delivery_boy_id: deliveryBoyId,
      });
      // optimistic local update
      setOrders(prev =>
        prev.map(o =>
          o.user_order_id === orderId
            ? { ...o, delivery_boy_id: deliveryBoyId }
            : o
        )
      );
      // update drawer if open
      if (selectedOrder?.user_order_id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, delivery_boy_id: deliveryBoyId } : prev);
      }
    } catch (error) {
      console.error("Failed to assign delivery boy:", error);
    } finally {
      setAssigningOrderId(null);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
    const paid         = orders.filter(o => o.payment_status === "paid").length;
    const pending      = orders.filter(o => o.payment_status === "pending").length;
    const delivered    = orders.filter(o => o.order_status   === "delivered").length;
    return { totalRevenue, paid, pending, delivered };
  }, [orders]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return (orders ?? []).filter(order => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        String(order.user_order_id).includes(q) ||
        (order.user_name  ?? "").toLowerCase().includes(q) ||
        (order.user_email ?? "").toLowerCase().includes(q) ||
        (order.order_delivery_address ?? "").toLowerCase().includes(q);
      const matchesPayment =
        paymentFilter === "all" || order.payment_status === paymentFilter;
      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;
      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, searchTerm, paymentFilter, statusFilter]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage) return;
    getOrdersList(page);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [currentPage, lastPage]);

  const startItem = total === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const endItem   = Math.min(currentPage * PER_PAGE, total);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const getDeliveryBoyName = (id: number | null) => {
    if (!id) return "Not assigned";
    return deliveryBoys.find(db => db.id === id)?.name ?? `ID #${id}`;
  };

  return (
    <div className="ord-root">

      {/* ── Page header ── */}
      <div className="ord-page-header">
        <div className="ord-page-header-left">
          <div className="ord-page-icon">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 className="ord-page-title">Orders</h1>
            <p className="ord-page-sub">Track, manage and fulfil customer orders</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="ord-stats">
        <div className="ord-stat-card ord-stat-revenue">
          <div className="ord-stat-icon"><TrendingUp size={20} /></div>
          <div>
            <p className="ord-stat-label">Page Revenue</p>
            <p className="ord-stat-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
        <div className="ord-stat-card ord-stat-paid">
          <div className="ord-stat-icon"><CreditCard size={20} /></div>
          <div>
            <p className="ord-stat-label">Paid</p>
            <p className="ord-stat-value">{stats.paid}</p>
          </div>
        </div>
        <div className="ord-stat-card ord-stat-pending">
          <div className="ord-stat-icon"><Clock size={20} /></div>
          <div>
            <p className="ord-stat-label">Pending</p>
            <p className="ord-stat-value">{stats.pending}</p>
          </div>
        </div>
        <div className="ord-stat-card ord-stat-delivered">
          <div className="ord-stat-icon"><Truck size={20} /></div>
          <div>
            <p className="ord-stat-label">Delivered</p>
            <p className="ord-stat-value">{stats.delivered}</p>
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="ord-card">

        {/* Card header */}
        <div className="ord-card-header">
          <h2 className="ord-card-title">All Orders</h2>
          <span className="ord-total-badge">{total} total</span>
        </div>

        {/* Filters */}
        <div className="ord-filters">
          <div className="ord-search-bar">
            <Search size={14} className="ord-search-icon" />
            <input
              type="text"
              placeholder="Search by order ID, customer, address…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ord-filter-select">
            <Filter size={13} />
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as any)}>
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="ord-filter-select">
            <Filter size={13} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="ord-table-scroll">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Delivery Date</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Delivery Boy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="ord-empty">
                    <div className="ord-loading">
                      <div className="ord-spinner" />
                      Loading orders…
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const pay = paymentConfig[order.payment_status]   ?? paymentConfig.pending;
                  const ost = order.order_status
                    ? orderStatusConfig[order.order_status] ?? orderStatusConfig.processing
                    : null;
                  return (
                    <tr key={order.user_order_id} className="ord-row">
                      <td>
                        <span className="ord-id">#{order.user_order_id}</span>
                      </td>
                      <td>
                        <div className="ord-customer">
                          <div className="ord-avatar">
                            {(order.user_name ?? "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="ord-customer-name">{order.user_name ?? "—"}</p>
                            <p className="ord-customer-email">{order.user_email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ord-items-count">
                          {order.items?.length ?? "—"} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <span className="ord-amount">{formatCurrency(Number(order.total_amount))}</span>
                      </td>
                      <td>
                        <span className="ord-date">{formatDate(order.delivery_date)}</span>
                      </td>
                      <td>
                        <span className={`ord-badge ${pay.cls}`}>
                          {pay.icon}{pay.label}
                        </span>
                      </td>
                      <td>
                        {ost ? (
                          <span className={`ord-badge ${ost.cls}`}>
                            {ost.icon}{ost.label}
                          </span>
                        ) : <span className="ord-na">—</span>}
                      </td>

                      {/* ── Delivery Boy Assignment ── */}
                      <td>
                        <div className="ord-assign-wrap">
                          {assigningOrderId === order.user_order_id ? (
                            <div className="ord-spinner-sm" />
                          ) : (
                            <select
                              className="ord-assign-select"
                              value={order.delivery_boy_id ?? ""}
                              onChange={e => assignDeliveryBoy(order.user_order_id, Number(e.target.value))}
                            >
                              <option value="" disabled>Assign…</option>
                              {deliveryBoys
                                .filter(db => db.is_active)
                                .map(db => (
                                  <option key={db.id} value={db.id}>{db.name}</option>
                                ))
                              }
                            </select>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          className="ord-view-btn"
                          onClick={() => openDrawer(order)}
                          title="View details"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="ord-empty">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="ord-card-footer">
          <span className="ord-footer-count">
            Showing {startItem}–{endItem} of {total} orders
          </span>

          {lastPage > 1 && (
            <div className="ord-pagination">
              <button
                className="ord-page-btn nav"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={15} />
              </button>

              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="ord-page-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`ord-page-btn ${p === currentPage ? "active" : ""}`}
                    onClick={() => goToPage(p as number)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="ord-page-btn nav"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === lastPage}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Order detail drawer ── */}
      {drawerOpen && (
        <div className="ord-overlay" onClick={closeDrawer}>
          <div
            className={`ord-drawer ${drawerOpen ? "ord-drawer-open" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedOrder && (
              <>
                <div className="ord-drawer-header">
                  <div>
                    <p className="ord-drawer-label">Order Details</p>
                    <h2 className="ord-drawer-id">#{selectedOrder.user_order_id}</h2>
                  </div>
                  <button className="ord-drawer-close" onClick={closeDrawer}>✕</button>
                </div>

                {/* Customer info */}
                <div className="ord-drawer-section">
                  <h3 className="ord-drawer-section-title">Customer</h3>
                  <div className="ord-drawer-customer">
                    <div className="ord-drawer-avatar">
                      {(selectedOrder.user_name ?? "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="ord-drawer-customer-name">{selectedOrder.user_name ?? "—"}</p>
                      <p className="ord-drawer-customer-email">{selectedOrder.user_email ?? "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="ord-drawer-section">
                  <h3 className="ord-drawer-section-title">Delivery</h3>
                  <div className="ord-drawer-info-grid">
                    <div className="ord-drawer-info-item">
                      <span className="ord-drawer-info-label">Address</span>
                      <span className="ord-drawer-info-value">{selectedOrder.order_delivery_address || "—"}</span>
                    </div>
                    <div className="ord-drawer-info-item">
                      <span className="ord-drawer-info-label">Delivery Date</span>
                      <span className="ord-drawer-info-value">{formatDate(selectedOrder.delivery_date)}</span>
                    </div>
                    <div className="ord-drawer-info-item">
                      <span className="ord-drawer-info-label">Delivery Boy</span>
                      <span className="ord-drawer-info-value">
                        {getDeliveryBoyName(selectedOrder.delivery_boy_id)}
                      </span>
                    </div>
                    <div className="ord-drawer-info-item">
                      <span className="ord-drawer-info-label">Order Date</span>
                      <span className="ord-drawer-info-value">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Assign delivery boy inside drawer */}
                <div className="ord-drawer-section">
                  <h3 className="ord-drawer-section-title">Assign Delivery Boy</h3>
                  <div className="ord-assign-wrap ord-assign-drawer">
                    {assigningOrderId === selectedOrder.user_order_id ? (
                      <div className="ord-spinner-sm" />
                    ) : (
                      <select
                        className="ord-assign-select"
                        value={selectedOrder.delivery_boy_id ?? ""}
                        onChange={e => assignDeliveryBoy(selectedOrder.user_order_id, Number(e.target.value))}
                      >
                        <option value="" disabled>Select delivery boy…</option>
                        {deliveryBoys
                          .filter(db => db.is_active)
                          .map(db => (
                            <option key={db.id} value={db.id}>{db.name} — {db.phone}</option>
                          ))
                        }
                      </select>
                    )}
                  </div>
                </div>

                {/* Status row */}
                <div className="ord-drawer-section">
                  <h3 className="ord-drawer-section-title">Status</h3>
                  <div className="ord-drawer-status-row">
                    {(() => {
                      const pay = paymentConfig[selectedOrder.payment_status] ?? paymentConfig.pending;
                      return (
                        <div className="ord-drawer-status-item">
                          <span className="ord-drawer-info-label">Payment</span>
                          <span className={`ord-badge ${pay.cls}`}>{pay.icon}{pay.label}</span>
                        </div>
                      );
                    })()}
                    {selectedOrder.order_status && (() => {
                      const ost = orderStatusConfig[selectedOrder.order_status!] ?? orderStatusConfig.processing;
                      return (
                        <div className="ord-drawer-status-item">
                          <span className="ord-drawer-info-label">Order</span>
                          <span className={`ord-badge ${ost.cls}`}>{ost.icon}{ost.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Order items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="ord-drawer-section">
                    <h3 className="ord-drawer-section-title">Items</h3>
                    <div className="ord-drawer-items">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="ord-drawer-item">
                          <div className="ord-drawer-item-icon">
                            <Package size={16} />
                          </div>
                          <div className="ord-drawer-item-info">
                            <p className="ord-drawer-item-name">
                              {item.product_name ?? `Product #${item.product_id}`}
                            </p>
                            <p className="ord-drawer-item-meta">
                              {item.quantity} × {formatCurrency(Number(item.price))}
                            </p>
                          </div>
                          <span className="ord-drawer-item-subtotal">
                            {formatCurrency(Number(item.subtotal))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="ord-drawer-total">
                  <span>Total Amount</span>
                  <span className="ord-drawer-total-value">
                    {formatCurrency(Number(selectedOrder.total_amount))}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;