import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Package, Search, Trash2, Pencil, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import "./Products.css";
import { api } from "../../services/api";

type ProductStatusKey = "in_stock" | "low_stock" | "out_of_stock";

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_image: string | null;
  product_price: number;
  product_stock: number;
  product_status: number | ProductStatusKey;
  category_name: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

const statusLabel: Record<ProductStatusKey, { label: string; cls: string }> = {
  in_stock:     { label: "In Stock",     cls: "badge-active"   },
  low_stock:    { label: "Low Stock",    cls: "badge-warning"  },
  out_of_stock: { label: "Out of Stock", cls: "badge-inactive" },
};

const statusMap: Record<number, ProductStatusKey> = {
  1: "in_stock",
  0: "out_of_stock",
};

const resolveStatus = (raw: Product["product_status"]): ProductStatusKey => {
  if (typeof raw === "number") return statusMap[raw] ?? "out_of_stock";
  return raw as ProductStatusKey;
};

const PER_PAGE = 10;

const Products = () => {
  const [searchTerm, setSearchTerm]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter]     = useState<"all" | ProductStatusKey>("all");
  const [products, setProducts]             = useState<Product[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [deleteId, setDeleteId]             = useState<number | null>(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [lastPage, setLastPage]             = useState(1);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(false);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  // ── Fetch products ──────────────────────────────────────────────────────
  // Supports BOTH controller response shapes:
  //   Shape A (nested):  { data: { data: [...], total, current_page, last_page }, message }
  //   Shape B (flat):    { data: [...], total, current_page, last_page, message }
  const getProductsList = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(
        `products/getall?page=${page}&per_page=${PER_PAGE}`
      );

      const body = response.data;

      // Detect which shape the controller returned
      const isNested =
        body.data !== null &&
        typeof body.data === "object" &&
        !Array.isArray(body.data) &&
        "data" in body.data;

      const res = isNested ? body.data : body;

      setProducts(Array.isArray(res.data) ? res.data : []);
      setTotal(res.total        ?? 0);
      setLastPage(res.last_page ?? 1);
      setCurrentPage(res.current_page ?? page);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch categories for the filter dropdown ────────────────────────────
  // Supports both paginated and flat category responses
  const getCategoriesList = async () => {
    try {
      const response = await api.get("categories/getall?per_page=100");
      const result = response.data.data;
      setCategories(Array.isArray(result) ? result : (result?.data ?? []));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    getProductsList(1);
    getCategoriesList();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredProducts = useMemo(() => {
    return (products ?? []).filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || String(product.category_id) === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || resolveStatus(product.product_status) === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.post(`products/delete/${deleteId}`);
      const nextPage =
        filteredProducts.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      getProductsList(nextPage);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      setDeleteId(null);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage) return;
    getProductsList(page);
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

  return (
    <div>
      <div className="prod-page">
        <div className="prod-card">

          {/* Card header */}
          <div className="prod-card-header">
            <h2 className="prod-card-title">Products</h2>
            <Link to="/products/new" className="prod-add-btn">
              <Package size={16} />
              Add Product
            </Link>
          </div>

          {/* Filters row */}
          <div className="prod-filters">
            <div className="prod-search-bar">
              <Search size={15} className="prod-search-icon" />
              <input
                type="text"
                placeholder="Search by name or description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="prod-filter-select">
              <Filter size={14} className="prod-filter-icon" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.category_id} value={String(cat.category_id)}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="prod-filter-select">
              <Filter size={14} className="prod-filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | ProductStatusKey)}
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="prod-table-scroll">
            <table className="prod-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Created On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="prod-empty">Loading…</td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => {
                    const statusKey = resolveStatus(product.product_status);
                    const status    = statusLabel[statusKey] ?? { label: "Unknown", cls: "badge-inactive" };
                    return (
                      <tr key={product.product_id}>
                        <td className="prod-td-num">
                          {(currentPage - 1) * PER_PAGE + index + 1}
                        </td>
                        <td>
                          <div className="prod-img-thumb">
                            {product.product_image ? (
                              <img
                                src={IMAGE_BASE_URL + "/" + product.product_image}
                                alt={product.product_name}
                              />
                            ) : (
                              <div className="prod-img-placeholder">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="prod-td-name">{product.product_name}</td>
                        <td className="prod-td-price">${Number(product.product_price).toFixed(2)}</td>
                        <td className="prod-td-stock">{product.product_stock}</td>
                        <td className="prod-td-date">{formatDate(product.created_at)}</td>
                        <td>
                          <span className={`prod-badge ${status.cls}`}>{status.label}</span>
                        </td>
                        <td>
                          <div className="prod-actions">
                            <button className="prod-icon-btn preview" title="Preview">
                              <Eye size={15} />
                            </button>
                            <Link
                              className="prod-icon-btn edit"
                              to={`/products/edit/${product.product_id}`}
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              className="prod-icon-btn delete"
                              title="Delete"
                              onClick={() => setDeleteId(product.product_id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="prod-empty">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: count + pagination */}
          <div className="prod-card-footer">
            <span className="prod-footer-count">
              Showing {startItem}–{endItem} of {total} products
            </span>

            {lastPage > 1 && (
              <div className="prod-pagination">
                <button
                  className="prod-page-btn nav"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="prod-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`prod-page-btn ${p === currentPage ? "active" : ""}`}
                      onClick={() => goToPage(p as number)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="prod-page-btn nav"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === lastPage}
                  title="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete modal */}
      {deleteId !== null && (
        <div className="prod-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="prod-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prod-modal-icon">
              <Trash2 size={28} />
            </div>
            <h3 className="prod-modal-title">Delete Product</h3>
            <p className="prod-modal-msg">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="prod-modal-actions">
              <button className="prod-modal-btn cancel" onClick={() => setDeleteId(null)}>
                No, Cancel
              </button>
              <button className="prod-modal-btn confirm" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;