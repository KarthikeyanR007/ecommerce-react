import { useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";
import { api } from "../../services/api";
import "./AddCategory.css";

interface CategoryFormState {
  name: string;
  description: string;
  image: File | null;
}

const AddCategory = () => {
  const [form, setForm] = useState<CategoryFormState>({
    name: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFieldChange =
    (field: "name" | "description") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (form.image) {
        formData.append("image", form.image);
      }
      await api.post("categories/add", formData);
      // alert("Category added successfully");
      // reset form
      setForm({
        name: "",
        description: "",
        image: null,
      });
      setImagePreview(null);

    } catch (error) {
      console.error("Error adding category:", error);
    }
  };
// user_id_time
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
          >
            Add Category
          </button>
        </div>
      </header>

      <div className="add-category-layout">
        <div className="add-category-main">
          <section className="add-category-card">
            <header>
              <LayoutGrid size={18} />
              <div>
                <h2>Add Category</h2>
              </div>
            </header>

            <div className="add-category-form-grid">

              <label className="add-category-field">
                <span>Category Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleFieldChange("name")}
                />
              </label>

              <label className="add-category-field">
                <span>Category Image</span>
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