import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Boxes, Search, Trash2 , Pencil, Eye } from "lucide-react";
import "./Categories.css";
import { api } from "../../services/api";

type CategoryTier = "signature" | "growth" | "seasonal";

interface Category {
  category_id: number;
  category_name: string;
  category_description: string;
  category_image: string;
  category_status: number;
  created_at: string;
  updated_at: string;
}

interface CategoryResponse {
  data: Category[];
  message: string;
}

const statusLabel: Record<number, { label: string; cls: string }> = {
  1: { label: "Active",   cls: "badge-active"   },
  0: { label: "Inactive", cls: "badge-inactive" },
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | CategoryTier>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.category_description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [categories, searchTerm, tierFilter]);

  useEffect(() => {
    getCategoriesList();
  }, []);

  const getCategoriesList = async () => {
    try {
      const response = await api.get<CategoryResponse>("categories/getall");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.post(`categories/delete/${deleteId}`);
      setCategories(prev => prev.filter(c => c.category_id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="cat-page">
      {/* Table card */}
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => {
                  const status = statusLabel[category.category_status] ?? { label: "Unknown", cls: "badge-inactive" };
                  return (
                    <tr key={category.category_id}>
                      <td className="cat-td-num">{index + 1}</td>
                      <td>
                        <div className="cat-img-thumb">
                          <img
                            src={IMAGE_BASE_URL + "/" + category.category_image}
                            alt={category.category_name}
                          />
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
                          <Link className="cat-icon-btn edit" to={`/categories/edit/${category.category_id}`} title="Edit">
                            <Pencil size={15} />
                          </Link>
                          <button className="cat-icon-btn delete" title="Delete" onClick={() => setDeleteId(category.category_id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="cat-empty">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="cat-card-footer">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>

      </div>
      </div>
      {deleteId !== null && (
        <div className="cat-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="cat-modal" onClick={e => e.stopPropagation()}>
            <div className="cat-modal-icon">
              <Trash2 size={28} />
            </div>
            <h3 className="cat-modal-title">Delete Category</h3>
            <p className="cat-modal-msg">Are you sure you want to delete this category? This action cannot be undone.</p>
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
