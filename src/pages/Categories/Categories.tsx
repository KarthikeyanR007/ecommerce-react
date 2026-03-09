import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Boxes, Search, Trash2, Pencil, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import "./Categories.css";
import { api } from "../../services/api";

interface Category {
  category_id: number;
  category_name: string;
  category_description: string;
  category_image: string | null;
  category_status: number;
  created_at: string;
  updated_at: string;
}

// API returns: { data: { data: [...], total, current_page, last_page, per_page }, message }
interface PaginatedCategories {
  data: Category[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface CategoryResponse {
  data: PaginatedCategories;
  message: string;
}

const statusLabel: Record<number, { label: string; cls: string }> = {
  1: { label: "Active",   cls: "badge-active"   },
  0: { label: "Inactive", cls: "badge-inactive" },
};

const PER_PAGE = 10;

const Categories = () => {
  const [searchTerm, setSearchTerm]   = useState("");
  const [categories, setCategories]   = useState<Category[]>([]);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [loading, setLoading]         = useState(false);

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [total, setTotal]             = useState(0);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const getCategoriesList = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get<CategoryResponse>(
        `categories/getall?page=${page}&per_page=${PER_PAGE}`
      );
      const res = response.data.data;
      setCategories(res.data ?? []);
      setTotal(res.total);
      setLastPage(res.last_page);
      setCurrentPage(res.current_page);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategoriesList(1);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Client-side search filter on current page data
  const filteredCategories = useMemo(() => {
    return (categories ?? []).filter((category) =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.category_description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.post(`categories/delete/${deleteId}`);
      // If deleting last item on page, go back one page
      const nextPage =
        filteredCategories.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      getCategoriesList(nextPage);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setDeleteId(null);
    }
  };

  // ── Pagination helpers ────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage) return;
    getCategoriesList(page);
  };

  // Smart page numbers: always show first, last, current ±1, with ellipsis
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
      <div className="cat-page">
        <div className="cat-card">

          {/* Card header */}
          <div className="cat-card-header">
            <h2 className="cat-card-title">Categories</h2>
            <Link to="/categories/new" className="cat-add-btn">
              <Boxes size={16} />
              Add Category
            </Link>
          </div>

          {/* Search bar */}
          <div className="cat-search-bar">
            <Search size={15} className="cat-search-icon" />
            <input
              type="text"
              placeholder="Search by name or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="cat-table-scroll">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="cat-empty">Loading…</td>
                  </tr>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => {
                    const status =
                      statusLabel[category.category_status] ??
                      { label: "Unknown", cls: "badge-inactive" };
                    return (
                      <tr key={category.category_id}>
                        <td className="cat-td-num">
                          {(currentPage - 1) * PER_PAGE + index + 1}
                        </td>
                        <td>
                          <div className="cat-img-thumb">
                            {category.category_image ? (
                              <img
                                src={IMAGE_BASE_URL + "/" + category.category_image}
                                alt={category.category_name}
                              />
                            ) : (
                              <div className="cat-img-placeholder">
                                <Boxes size={16} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="cat-td-name">{category.category_name}</td>
                        <td className="cat-td-desc">{category.category_description}</td>
                        <td className="cat-td-date">{formatDate(category.created_at)}</td>
                        <td>
                          <span className={`cat-badge ${status.cls}`}>{status.label}</span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button className="cat-icon-btn preview" title="Preview">
                              <Eye size={15} />
                            </button>
                            <Link
                              className="cat-icon-btn edit"
                              to={`/categories/edit/${category.category_id}`}
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              className="cat-icon-btn delete"
                              title="Delete"
                              onClick={() => setDeleteId(category.category_id)}
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
                    <td colSpan={7} className="cat-empty">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: count + pagination */}
          <div className="cat-card-footer">
            <span className="cat-footer-count">
              Showing {startItem}–{endItem} of {total} categories
            </span>

            {lastPage > 1 && (
              <div className="cat-pagination">
                <button
                  className="cat-page-btn nav"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="cat-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`cat-page-btn ${p === currentPage ? "active" : ""}`}
                      onClick={() => goToPage(p as number)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="cat-page-btn nav"
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
        <div className="cat-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal-icon">
              <Trash2 size={28} />
            </div>
            <h3 className="cat-modal-title">Delete Category</h3>
            <p className="cat-modal-msg">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="cat-modal-actions">
              <button className="cat-modal-btn cancel" onClick={() => setDeleteId(null)}>
                No, Cancel
              </button>
              <button className="cat-modal-btn confirm" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;