import { Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  ImagePlus,
  Package,
  Tag,
  Truck,
} from "lucide-react";
import "./AddProduct.css";

const AddProduct = () => {
  return (
    <div className="add-product-page">
      <div className="add-product-header">
        <div>
          <Link className="add-product-back" to="/products">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <h1>New Product</h1>
          <p>Craft a premium listing that is ready to convert.</p>
        </div>
        <div className="add-product-actions">
          <button className="add-product-btn ghost" type="button">
            Save Draft
          </button>
          <button className="add-product-btn primary" type="button">
            Publish Product
          </button>
        </div>
      </div>

      <div className="add-product-grid">
        <div className="add-product-main">
          <section className="add-product-card">
            <header>
              <Package size={18} />
              <div>
                <h2>Product Details</h2>
                <p>Name, description, and category alignment.</p>
              </div>
            </header>
            <div className="add-product-form-grid">
              <label className="add-product-field">
                <span>Product Name</span>
                <input type="text" placeholder="Aurora Smart Lamp" />
              </label>
              <label className="add-product-field">
                <span>Category</span>
                <select>
                  <option>Home</option>
                  <option>Electronics</option>
                  <option>Apparel</option>
                  <option>Beauty</option>
                </select>
              </label>
              <label className="add-product-field full">
                <span>Short Description</span>
                <textarea placeholder="Capture the essence of the product in one line." rows={3} />
              </label>
            </div>
          </section>

          <section className="add-product-card">
            <header>
              <ImagePlus size={18} />
              <div>
                <h2>Media</h2>
                <p>Upload crisp visuals to elevate the listing.</p>
              </div>
            </header>
            <div className="add-product-upload">
              <div className="upload-panel">
                <ImagePlus size={22} />
                <span>Drop images here or browse</span>
                <small>Recommended: 1600 x 1200px, PNG/JPG</small>
                <button type="button">Upload Files</button>
              </div>
              <div className="upload-preview">
                <div className="preview-tile" />
                <div className="preview-tile" />
                <div className="preview-tile" />
              </div>
            </div>
          </section>

          <section className="add-product-card">
            <header>
              <DollarSign size={18} />
              <div>
                <h2>Pricing & Inventory</h2>
                <p>Keep margin, tax, and stock in sync.</p>
              </div>
            </header>
            <div className="add-product-form-grid">
              <label className="add-product-field">
                <span>Price</span>
                <input type="text" placeholder="$129.00" />
              </label>
              <label className="add-product-field">
                <span>Compare at</span>
                <input type="text" placeholder="$159.00" />
              </label>
              <label className="add-product-field">
                <span>SKU</span>
                <input type="text" placeholder="SKU-AX93-01" />
              </label>
              <label className="add-product-field">
                <span>Stock</span>
                <input type="number" placeholder="120" />
              </label>
            </div>
          </section>
        </div>

        <aside className="add-product-sidebar">
          <section className="add-product-card compact">
            <header>
              <Tag size={18} />
              <div>
                <h2>Status</h2>
                <p>Visibility and sales channel.</p>
              </div>
            </header>
            <div className="add-product-radio">
              <label>
                <input type="radio" name="status" defaultChecked />
                Active
              </label>
              <label>
                <input type="radio" name="status" />
                Draft
              </label>
            </div>
            <label className="add-product-field">
              <span>Tags</span>
              <input type="text" placeholder="modern, eco, premium" />
            </label>
          </section>

          <section className="add-product-card compact">
            <header>
              <Truck size={18} />
              <div>
                <h2>Shipping</h2>
                <p>Weight and dimensions.</p>
              </div>
            </header>
            <div className="add-product-form-grid">
              <label className="add-product-field">
                <span>Weight</span>
                <input type="text" placeholder="1.2 kg" />
              </label>
              <label className="add-product-field">
                <span>Dimensions</span>
                <input type="text" placeholder="24 x 18 x 12 cm" />
              </label>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AddProduct;
