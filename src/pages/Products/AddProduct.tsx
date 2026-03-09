import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Package, X } from "lucide-react";
import "./AddProduct.css";
import { api } from "../../services/api";

interface Category {
  category_id: number;
  category_name: string;
}

interface CategoryResponse {
  data: Category[];
  message: string;
}

interface FormState {
  product_name: string;
  category_id: string;
  product_description: string;
  product_price: string;
  discount_price: string;
  product_stock: string;
  product_status: string;
}

const INITIAL_FORM: FormState = {
  product_name: "",
  category_id: "",
  product_description: "",
  product_price: "",
  discount_price: "",
  product_stock: "",
  product_status: "in_stock",
};

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<CategoryResponse>("categories/getall");
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setForm((prev) => ({
            ...prev,
            category_id: String(res.data.data[0].category_id),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.product_name.trim()) newErrors.product_name = "Product name is required.";
    if (!form.category_id) newErrors.category_id = "Please select a category.";
    if (!form.product_description.trim()) newErrors.product_description = "Description is required.";
    if (!form.product_price || isNaN(Number(form.product_price)))
      newErrors.product_price = "Enter a valid price.";
    if (!form.product_stock || isNaN(Number(form.product_stock)))
      newErrors.product_stock = "Enter a valid stock quantity.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (status: "published" | "draft") => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_name", form.product_name.trim());
      formData.append("category_id", form.category_id);
      formData.append("product_description", form.product_description.trim());
      formData.append("product_price", form.product_price);
      formData.append("discount_price", form.discount_price);
      formData.append("product_stock", form.product_stock);
      formData.append("product_status", status === "draft" ? "out_of_stock" : form.product_status);
      images.forEach((img) => formData.append("product_image", img));

      await api.post("products/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/products");
    } catch (err) {
      console.error("Failed to add product:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
          <button
            className="add-product-btn ghost"
            type="button"
            disabled={submitting}
            onClick={() => submit("draft")}
          >
            {submitting ? "Saving…" : "Save Draft"}
          </button>
          <button
            className="add-product-btn primary"
            type="button"
            disabled={submitting}
            onClick={() => submit("published")}
          >
            {submitting ? "Publishing…" : "Publish Product"}
          </button>
        </div>
      </div>

      <div className="add-product-grid">
        <div className="add-product-main">

          {/* ── Product Details ── */}
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
                <input
                  type="text"
                  name="product_name"
                  placeholder="Aurora Smart Lamp"
                  value={form.product_name}
                  onChange={handleChange}
                />
                {errors.product_name && (
                  <span className="add-product-error">{errors.product_name}</span>
                )}
              </label>

              <label className="add-product-field">
                <span>Category</span>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={String(cat.category_id)}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <span className="add-product-error">{errors.category_id}</span>
                )}
              </label>

              <label className="add-product-field full">
                <span>Short Description</span>
                <textarea
                  name="product_description"
                  placeholder="Capture the essence of the product in one line."
                  rows={3}
                  value={form.product_description}
                  onChange={handleChange}
                />
                {errors.product_description && (
                  <span className="add-product-error">{errors.product_description}</span>
                )}
              </label>

            </div>
          </section>

          {/* ── Media ── */}
          <section className="add-product-card">
            <header>
              <ImagePlus size={18} />
              <div>
                <h2>Media</h2>
                <p>Upload crisp visuals to elevate the listing.</p>
              </div>
            </header>
            <div className="add-product-upload">
              <div
                className="upload-panel"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <ImagePlus size={22} />
                <span>Drop images here or browse</span>
                <small>Recommended: 1600 x 1200px, PNG/JPG</small>
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  Upload Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              <div className="upload-preview">
                {previews.length > 0 ? (
                  previews.map((src, i) => (
                    <div key={i} className="preview-tile filled">
                      <img src={src} alt={`preview-${i}`} />
                      <button
                        type="button"
                        className="preview-remove"
                        onClick={() => removeImage(i)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="preview-tile" />
                    <div className="preview-tile" />
                    <div className="preview-tile" />
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ── Pricing & Inventory ── */}
          <section className="add-product-card">
            <header>
              <div>
                <h2>Pricing & Inventory</h2>
                <p>Keep margin, tax, and stock in sync.</p>
              </div>
            </header>
            <div className="add-product-form-grid">

              <label className="add-product-field">
                <span>Price</span>
                <input
                  type="number"
                  name="product_price"
                  placeholder="129.00"
                  min="0"
                  step="0.01"
                  value={form.product_price}
                  onChange={handleChange}
                />
                {errors.product_price && (
                  <span className="add-product-error">{errors.product_price}</span>
                )}
              </label>

              <label className="add-product-field">
                <span>Discount</span>
                <input
                  type="number"
                  name="discount_price"
                  placeholder="159.00"
                  min="0"
                  step="0.01"
                  value={form.discount_price}
                  onChange={handleChange}
                />
              </label>

              <label className="add-product-field">
                <span>Stock</span>
                <input
                  type="number"
                  name="product_stock"
                  placeholder="120"
                  min="0"
                  value={form.product_stock}
                  onChange={handleChange}
                />
                {errors.product_stock && (
                  <span className="add-product-error">{errors.product_stock}</span>
                )}
              </label>

              <label className="add-product-field">
                <span>Status</span>
                <select
                  name="product_status"
                  value={form.product_status}
                  onChange={handleChange}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </label>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AddProduct;