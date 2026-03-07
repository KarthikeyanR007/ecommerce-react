import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  Globe,
  ImagePlus,
  LayoutGrid,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import "./AddCategory.css";

type Visibility = "public" | "private" | "draft";

interface CategoryFormState {
  name: string;
  parent: string;
  navLabel: string;
  description: string;
  heroImage: string;
  visualTheme: string;
  launchWindow: string;
  slug: string;
  featuredTags: string;
  marginTarget: string;
  assortmentDepth: string;
  seoTitle: string;
  seoDescription: string;
  visibility: Visibility;
}

const AddCategory = () => {
  const [form, setForm] = useState<CategoryFormState>({
    name: "Signature Apparel",
    parent: "Women",
    navLabel: "Signature",
    description: "A refined wardrobe world for tailoring, soft structure, and elevated essentials.",
    heroImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=60",
    visualTheme: "Quiet luxury with dark neutrals, warm brass, and editorial whitespace.",
    launchWindow: "April 2026",
    slug: "signature-apparel",
    featuredTags: "Tailoring, Cashmere, Occasion",
    marginTarget: "31%",
    assortmentDepth: "180",
    seoTitle: "Signature Apparel | Tailoring, knitwear, and elevated essentials",
    seoDescription:
      "Discover premium tailoring, luxe knitwear, and modern wardrobe icons curated for high-intent shoppers.",
    visibility: "public",
  });

  const handleFieldChange =
    (field: keyof CategoryFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const readinessChecks = useMemo(
    () => [
      {
        label: "Identity system",
        detail: "Name, navigation label, and parent hierarchy are set.",
        ready: Boolean(form.name && form.navLabel && form.parent),
      },
      {
        label: "Visual direction",
        detail: "Hero image and design language support the category mood.",
        ready: Boolean(form.heroImage && form.visualTheme),
      },
      {
        label: "Commercial intent",
        detail: "Margin target and assortment depth are aligned.",
        ready: Boolean(form.marginTarget && form.assortmentDepth),
      },
      {
        label: "Discovery layer",
        detail: "Slug and SEO copy are ready for launch surfaces.",
        ready: Boolean(form.slug && form.seoTitle && form.seoDescription),
      },
    ],
    [form]
  );

  const tags = form.featuredTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <div className="add-category-page">
      <header className="add-category-hero">
        <div className="add-category-hero-copy">
          <Link className="add-category-back" to="/categories">
            <ArrowLeft size={16} />
            Back to Categories
          </Link>
          <span className="add-category-kicker">Category Blueprint</span>
          <h1>Craft a category page with sharper taste and stronger commercial clarity.</h1>
          <p>
            Shape the navigation, visual direction, and storytelling rules before the assortment lands inside the
            experience.
          </p>
        </div>

        <div className="add-category-hero-actions">
          <button className="add-category-btn ghost" type="button">
            Save Draft
          </button>
          <button className="add-category-btn primary" type="button">
            Publish Blueprint
          </button>
        </div>
      </header>

      <div className="add-category-layout">
        <div className="add-category-main">
          <section className="add-category-card">
            <header>
              <LayoutGrid size={18} />
              <div>
                <h2>Identity</h2>
                <p>Name the category with authority and keep the navigation language concise.</p>
              </div>
            </header>

            <div className="add-category-form-grid">
              <label className="add-category-field">
                <span>Category Name</span>
                <input type="text" value={form.name} onChange={handleFieldChange("name")} />
              </label>

              <label className="add-category-field">
                <span>Parent Category</span>
                <select value={form.parent} onChange={handleFieldChange("parent")}>
                  <option>Women</option>
                  <option>Men</option>
                  <option>Home</option>
                  <option>Beauty</option>
                  <option>Electronics</option>
                </select>
              </label>

              <label className="add-category-field">
                <span>Navigation Label</span>
                <input type="text" value={form.navLabel} onChange={handleFieldChange("navLabel")} />
              </label>

              <label className="add-category-field">
                <span>Launch Window</span>
                <input type="text" value={form.launchWindow} onChange={handleFieldChange("launchWindow")} />
              </label>

              <label className="add-category-field full">
                <span>Category Story</span>
                <textarea rows={4} value={form.description} onChange={handleFieldChange("description")} />
              </label>
            </div>
          </section>

          <section className="add-category-card">
            <header>
              <Palette size={18} />
              <div>
                <h2>Visual Direction</h2>
                <p>Define how the category should look and feel before merchandisers start placing products.</p>
              </div>
            </header>

            <div className="add-category-form-grid">
              <label className="add-category-field full">
                <span>Hero Image URL</span>
                <input type="text" value={form.heroImage} onChange={handleFieldChange("heroImage")} />
              </label>

              <label className="add-category-field full">
                <span>Visual Theme</span>
                <textarea rows={3} value={form.visualTheme} onChange={handleFieldChange("visualTheme")} />
              </label>

              <label className="add-category-field full">
                <span>Featured Tags</span>
                <input type="text" value={form.featuredTags} onChange={handleFieldChange("featuredTags")} />
              </label>
            </div>
          </section>

          <section className="add-category-card">
            <header>
              <BadgePercent size={18} />
              <div>
                <h2>Commerce Guardrails</h2>
                <p>Set commercial expectations so the page stays premium without losing efficiency.</p>
              </div>
            </header>

            <div className="add-category-form-grid">
              <label className="add-category-field">
                <span>Margin Target</span>
                <input type="text" value={form.marginTarget} onChange={handleFieldChange("marginTarget")} />
              </label>

              <label className="add-category-field">
                <span>Assortment Depth</span>
                <input type="text" value={form.assortmentDepth} onChange={handleFieldChange("assortmentDepth")} />
              </label>

              <div className="add-category-visibility-group">
                <span>Visibility</span>
                <div className="add-category-visibility-options">
                  <label>
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={form.visibility === "public"}
                      onChange={handleFieldChange("visibility")}
                    />
                    Public
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={form.visibility === "private"}
                      onChange={handleFieldChange("visibility")}
                    />
                    Private
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="visibility"
                      value="draft"
                      checked={form.visibility === "draft"}
                      onChange={handleFieldChange("visibility")}
                    />
                    Draft
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="add-category-card">
            <header>
              <Search size={18} />
              <div>
                <h2>SEO & Discovery</h2>
                <p>Keep metadata aligned with the premium angle of the page.</p>
              </div>
            </header>

            <div className="add-category-form-grid">
              <label className="add-category-field">
                <span>Slug</span>
                <input type="text" value={form.slug} onChange={handleFieldChange("slug")} />
              </label>

              <label className="add-category-field">
                <span>SEO Title</span>
                <input type="text" value={form.seoTitle} onChange={handleFieldChange("seoTitle")} />
              </label>

              <label className="add-category-field full">
                <span>SEO Description</span>
                <textarea rows={3} value={form.seoDescription} onChange={handleFieldChange("seoDescription")} />
              </label>
            </div>
          </section>
        </div>

        <aside className="add-category-sidebar">
          <section className="add-category-preview-card">
            <div className="add-category-preview-media">
              <img src={form.heroImage} alt={form.name} />
              <div className="add-category-preview-overlay" />
              <span className={`add-category-status ${form.visibility}`}>{form.visibility}</span>
            </div>

            <div className="add-category-preview-body">
              <span className="add-category-preview-parent">{form.parent}</span>
              <h3>{form.name}</h3>
              <p>{form.description}</p>

              <div className="add-category-preview-meta">
                <div>
                  <CalendarDays size={16} />
                  <span>{form.launchWindow}</span>
                </div>
                <div>
                  <Tag size={16} />
                  <span>{form.navLabel}</span>
                </div>
                <div>
                  <Globe size={16} />
                  <span>/{form.slug}</span>
                </div>
              </div>

              <div className="add-category-preview-tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="add-category-card compact">
            <header>
              <ShieldCheck size={18} />
              <div>
                <h2>Launch Readiness</h2>
                <p>Check the essentials before merchandisers publish.</p>
              </div>
            </header>

            <div className="add-category-checklist">
              {readinessChecks.map((item) => (
                <div key={item.label} className={`add-category-check-item ${item.ready ? "ready" : ""}`}>
                  <span className="add-category-check-icon">
                    <CheckCircle2 size={16} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="add-category-card compact">
            <header>
              <ImagePlus size={18} />
              <div>
                <h2>Premium Notes</h2>
                <p>Keep the execution elevated once the category goes live.</p>
              </div>
            </header>

            <ul className="add-category-notes">
              <li>Use one dominant hero story, not multiple competing messages.</li>
              <li>Keep collection labels short so the interface feels expensive, not noisy.</li>
              <li>Balance bestseller proof with generous spacing and deliberate typography.</li>
            </ul>

            <div className="add-category-highlight">
              <Sparkles size={18} />
              <p>{form.visualTheme}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AddCategory;
