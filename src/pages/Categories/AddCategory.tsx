import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";
import { api } from "../../services/api";
import "./AddCategory.css";

interface CategoryFormState {
  name: string;
  description: string;
  image: File | null;
}

const AddCategory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  const [form, setForm] = useState<CategoryFormState>({
    name: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  // Fetch existing category data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchCategory = async () => {
      try {
        setFetching(true);
        const response = await api.get(`categories/get/${id}`);
        const category = response.data.data;
        setForm({
          name: category.category_name,
          description: category.category_description,
          image: null,
        });
        if (category.category_image) {
          setImagePreview(IMAGE_BASE_URL + "/" + category.category_image);
        }
      } catch (error) {
        console.error("Failed to fetch category:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id, isEditMode]);

  const handleFieldChange =
    (field: "name" | "description") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (form.image) {
        formData.append("image", form.image);
      }

      if (isEditMode) {
        await api.post(`categories/update/${id}`, formData);
      } else {
        await api.post("categories/add", formData);
        setForm({ name: "", description: "", image: null });
        setImagePreview(null);
      }

      navigate("/categories");
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="add-category-page">
        <div className="add-category-loading">Loading category...</div>
      </div>
    );
  }

  return (
    <div className="add-category-page">
      <header className="add-category-hero">
        <div className="add-category-hero-copy">
          <Link className="add-category-back" to="/categories">
            <ArrowLeft size={16} />
            Back to Categories
          </Link>
        </div>

        <div className="add-category-hero-actions">
          <button
            className="add-category-btn primary"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? isEditMode ? "Saving..." : "Adding..."
              : isEditMode ? "Save Changes" : "Add Category"
            }
          </button>
        </div>
      </header>

      <div className="add-category-layout">
        <div className="add-category-main">
          <section className="add-category-card">
            <header>
              <LayoutGrid size={18} />
              <div>
                <h2>{isEditMode ? "Edit Category" : "Add Category"}</h2>
                <p>{isEditMode ? "Update the category details below." : "Fill in the details to create a new category."}</p>
              </div>
            </header>

            <div className="add-category-form-grid">

              <label className="add-category-field">
                <span>Category Name</span>
                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  value={form.name}
                  onChange={handleFieldChange("name")}
                />
              </label>

              <label className="add-category-field">
                <span>Category Image {isEditMode && "(upload to replace)"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <label className="add-category-field full">
                <span>Category Description</span>
                <textarea
                  rows={4}
                  placeholder="Describe this category..."
                  value={form.description}
                  onChange={handleFieldChange("description")}
                />
              </label>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
