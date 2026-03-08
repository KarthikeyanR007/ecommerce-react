import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Boxes,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
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

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | CategoryTier>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

      const filteredCategories = useMemo(() => {
          return categories.filter((category) => {
            const matchesSearch =
              category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              category.category_description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
          });
        }, [categories, searchTerm, tierFilter]);

  useEffect(()=>{
    getCategoriesList();
  },[]);

  const getCategoriesList = async () => {
    try {
      const response = await api.get<CategoryResponse>("categories/getall");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  };  
  
  return (
    <div className="categories-page">
      <section className="categories-hero">
      </section>

      <section className="categories-toolbar">
        <div className="categories-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search categories, themes, or top picks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

          <Link to="/categories/new" className="categories-toolbar-note">
            <Boxes size={18} />
            <span>Add Category</span>
          </Link>
      </section>

      <section className="categories-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <article key={category.category_id} className="category-card">
              <div className="category-card-media" >
                <img src={ IMAGE_BASE_URL +'/'+category.category_image} alt={category.category_name} />
                <div className="category-card-media-overlay" />
                <div className="category-card-pills">
                </div>
              </div>

              <div className="category-card-body">
                <div className="category-card-heading">
                  <div>
                    <h3>{category.category_name}</h3>
                  </div>

                  <button className="category-card-arrow" type="button" aria-label={`Preview ${category.category_name}`}>
                    <ArrowUpRight size={18} />
                  </button>
                </div>

                <p className="category-card-description">{category.category_description}</p>

                <div className="category-card-metrics">
                  <div>
                    <span>Products</span>
                    {/* <strong>{category.productCount}</strong> */}
                  </div>
                  <div>
                    <span>Growth</span>
                    {/* <strong>+{category.growth}%</strong> */}
                  </div>
                  <div>
                    <span>Margin</span>
                    {/* <strong>{category.margin}%</strong> */}
                  </div>
                  <div>
                    <span>Featured</span>
                    {/* <strong>{category.featuredCount}</strong> */}
                  </div>
                </div>

                <div className="category-card-footer">
                  <button className="category-btn ghost" type="button">
                    <Users size={16} />
                    <span>Preview</span>
                  </button>
                  <Link className="category-btn solid" to="/categories/new">
                    <Sparkles size={16} />
                    <span>Edit Blueprint</span>
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="categories-empty-state">
            <h3>No category matches found</h3>
            <p>Try a broader keyword or switch the tier filter back to all.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Categories;
