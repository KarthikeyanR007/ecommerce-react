import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Search, Trash2, Pencil, Eye, Filter } from "lucide-react";
import "./Products.css";
import { api } from "../../services/api";

type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_image: string;
  product_price: number;
  product_stock: number;
  product_status: ProductStatus;
  category_name: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

interface ProductResponse {
  data: Product[];
  message: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface CategoryResponse {
  data: Category[];
  message: string;
}

const statusLabel: Record<ProductStatus, { label: string; cls: string }> = {
  in_stock:     { label: "In Stock",     cls: "badge-active"   },
  low_stock:    { label: "Low Stock",    cls: "badge-warning"  },
  out_of_stock: { label: "Out of Stock", cls: "badge-inactive" },
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    getProductsList();
    getCategoriesList();
  }, []);

  const getProductsList = async () => {
    try {
      const response = await api.get<ProductResponse>("products/getall");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const getCategoriesList = async () => {
    try {
      const response = await api.get<CategoryResponse>("categories/getall");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_description.toLowerCase().includes(searchTerm.toLowerCase()); 
      const matchesCategory =
        categoryFilter === "all" || String(product.category_id) === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || product.product_status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.post(`products/delete/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.product_id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      setDeleteId(null);
    }
  };

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
                placeholder="Search by name, description or category…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="prod-filter-select">
              <Filter size={14} className="prod-filter-icon" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
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
                onChange={(e) => setStatusFilter(e.target.value as "all" | ProductStatus)}
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
                  {/* <th>Category</th> */}
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Created On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => {
                    const status =
                      statusLabel[product.product_status] ??
                      { label: "Unknown", cls: "badge-inactive" };
                    return (
                      <tr key={product.product_id}>
                        <td className="prod-td-num">{index + 1}</td>
                        <td>
                          <div className="prod-img-thumb">
                            <img
                              src={IMAGE_BASE_URL + "/" + product.product_image}
                              alt={product.product_name}
                            />
                          </div>
                        </td>
                        <td className="prod-td-name">{product.product_name}</td>
                        {/* <td className="prod-td-category">{product.category_name}</td> */}
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
                    <td colSpan={9} className="prod-empty">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="prod-card-footer">
            Showing {filteredProducts.length} of {products.length} products
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