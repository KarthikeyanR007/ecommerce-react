import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Package, X } from "lucide-react";
import "./AddProduct.css";
import { api } from "../../services/api";

interface Category {
  category_id: number;
  category_name: string;
}

interface PaginatedData {
  current_page: number;
  data: Category[];  // ← the actual array is here
  total: number;
  last_page: number;
}
interface CategoryResponse {
  data: PaginatedData;  // ← data is a pagination object, not Category[]
  message: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_image: string;
  product_price: number;
  product_stock: number;
  product_status: string;
  product_discount:number;
  category_id: number;
}

interface ProductResponse {
  data: Product;
  message: string;
}

interface FormState {
  product_name: string;
  category_id: string;
  product_description: string;
  product_price: string;
  product_discount: string;
  product_stock: string;
  product_status: string;
}

const INITIAL_FORM: FormState = {
  product_name: "",
  category_id: "",
  product_description: "",
  product_price: "",
  product_discount: "",
  product_stock: "",
  product_status: "in_stock",
};

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImage, setExistingImage] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const catRes = await api.get<CategoryResponse>("categories/getall");
        setCategories(catRes.data.data.data);

        const prodRes = await api.get<ProductResponse>(`products/get/${id}`);
        const p = prodRes.data.data;

        setForm({
          product_name: p.product_name,
          category_id: String(p.category_id),
          product_description: p.product_description,
          product_price: String(p.product_price),
          product_discount: String(p.product_discount),
          product_stock: String(p.product_stock),
          product_status: p.product_status,
        });

        if (p.product_image) {
          setExistingImage(p.product_image);
          setPreviews([IMAGE_BASE_URL + "/" + p.product_image]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
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
    setExistingImage("");
  };

  const removeImage = (index: number) => {
    if (previews[index].startsWith("blob:")) {
      URL.revokeObjectURL(previews[index]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (!previews[index].startsWith("blob:")) {
      setExistingImage("");
    }
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

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_name", form.product_name.trim());
      formData.append("category_id", form.category_id);
      formData.append("product_description", form.product_description.trim());
      formData.append("product_price", form.product_price);
      formData.append("product_discount", form.product_discount);
      formData.append("product_stock", form.product_stock);
      formData.append("product_discount", form.product_discount);

      if (images.length > 0) {
        images.forEach((img) => formData.append("product_image", img));
      } else if (existingImage) {
        formData.append("product_image", existingImage);
      }

      await api.post(`products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/products");
    } catch (err) {
      console.error("Failed to update product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="add-product-page"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "#64748b", fontSize: "1rem" }}>Loading product…</p>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="add-product-header">
        <div>
          <Link className="add-product-back" to="/products">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <h1>Edit Product</h1>
          <p>Update the product details below.</p>
        </div>
        <div className="add-product-actions">
          <button
            className="add-product-btn ghost"
            type="button"
            disabled={submitting}
            onClick={() => submit()}
          >
            {submitting ? "Saving…" : "Save as Draft"}
          </button>
          <button
            className="add-product-btn primary"
            type="button"
            disabled={submitting}
            onClick={() => submit()}
          >
            {submitting ? "Updating…" : "Update Product"}
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
                <select name="category_id" value={form.category_id} onChange={handleChange}>
                  {/* Placeholder prevents browser resetting value when options are empty */}
                  <option value="" disabled>Select a category</option>
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
                  name="product_discount"
                  placeholder="159.00"
                  min="0"
                  step="0.01"
                  value={form.product_discount}
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
                <select name="product_status" value={form.product_status} onChange={handleChange}>
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

export default EditProduct;