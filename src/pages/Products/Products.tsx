import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Package,
  Plus,
  Search,
  Star,
  Truck,
  Boxes,
  BadgePercent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Products.css";

type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  sales: number;
  image: string;
}

interface Stat {
  label: string;
  value: string;
  Icon: LucideIcon;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");

  const products: Product[] = [
    {
      id: 1,
      name: "CloudFlex Running Shoes",
      category: "Footwear",
      price: 129.99,
      stock: 42,
      status: "in_stock",
      rating: 4.7,
      sales: 1280,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      name: "Aether Noise Cancelling Headphones",
      category: "Electronics",
      price: 249.0,
      stock: 12,
      status: "low_stock",
      rating: 4.8,
      sales: 920,
      image:
        "https://images.unsplash.com/photo-1518442386-f92b9b9e2a36?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 3,
      name: "Luna Ceramic Skin Set",
      category: "Home",
      price: 78.5,
      stock: 0,
      status: "out_of_stock",
      rating: 4.5,
      sales: 310,
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 4,
      name: "Nova Smartwatch Pro",
      category: "Electronics",
      price: 199.99,
      stock: 58,
      status: "in_stock",
      rating: 4.6,
      sales: 1540,
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 5,
      name: "Sage Linen Jacket",
      category: "Apparel",
      price: 149.0,
      stock: 16,
      status: "low_stock",
      rating: 4.4,
      sales: 670,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 6,
      name: "Aurora Coffee Station",
      category: "Home",
      price: 89.0,
      stock: 34,
      status: "in_stock",
      rating: 4.3,
      sales: 540,
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=60",
    },
  ];

  const stats: Stat[] = [
    { label: "Active Products", value: "1,284", Icon: Package },
    { label: "Low Stock", value: "42", Icon: Boxes },
    { label: "Back Orders", value: "18", Icon: Truck },
    { label: "Discounted", value: "126", Icon: BadgePercent },
  ];

  const categories = ["all", ...new Set(products.map((item) => item.category))];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const getStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return "";
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1 className="products-title">Products</h1>
          <p className="products-subtitle">Curate your catalog and keep stock perfectly balanced.</p>
        </div>
        <Link className="products-primary-btn" to="/products/new">
          <Plus size={18} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="products-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="products-stat-card">
            <div className="products-stat-icon">
              <stat.Icon size={20} />
            </div>
            <div>
              <span className="products-stat-label">{stat.label}</span>
              <span className="products-stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="products-filters">
        <div className="products-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="products-filter">
          <Filter size={18} />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
        <div className="products-filter">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | ProductStatus)}
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <article key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
              <span className={`product-status ${product.status}`}>{getStatusLabel(product.status)}</span>
            </div>
            <div className="product-body">
              <div className="product-meta">
                <span className="product-category">{product.category}</span>
                <div className="product-rating">
                  <Star size={14} />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
              </div>
              <h3 className="product-name">{product.name}</h3>
              <div className="product-details">
                <div>
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className="product-sales">{product.sales.toLocaleString()} sales</span>
                </div>
                <span className="product-stock">{product.stock} in stock</span>
              </div>
              <div className="product-actions">
                <button className="product-btn secondary" type="button">
                  View
                </button>
                <button className="product-btn primary" type="button">
                  Edit
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Products;
