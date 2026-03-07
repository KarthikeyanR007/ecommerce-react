import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgePercent,
  Boxes,
  LayoutGrid,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Categories.css";

type CategoryTier = "signature" | "growth" | "seasonal";

interface Category {
  id: number;
  name: string;
  slug: string;
  tier: CategoryTier;
  description: string;
  mood: string;
  audience: string;
  curator: string;
  productCount: number;
  activeCollections: number;
  featuredCount: number;
  conversion: number;
  growth: number;
  margin: number;
  image: string;
  palette: string;
  topPicks: string[];
}

interface Stat {
  label: string;
  value: string;
  note: string;
  Icon: LucideIcon;
}

const categoryData: Category[] = [
  {
    id: 1,
    name: "Signature Apparel",
    slug: "signature-apparel",
    tier: "signature",
    description: "Elevated tailoring, fine knitwear, and modern wardrobe icons designed for premium intent.",
    mood: "Quiet luxury wardrobe",
    audience: "Urban professionals",
    curator: "Maya Sinclair",
    productCount: 184,
    activeCollections: 12,
    featuredCount: 36,
    conversion: 4.8,
    growth: 18.2,
    margin: 31,
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=60",
    palette: "linear-gradient(135deg, rgba(20, 29, 38, 0.96), rgba(183, 143, 86, 0.8))",
    topPicks: ["Tailoring", "Cashmere", "Outerwear"],
  },
  {
    id: 2,
    name: "Modern Living",
    slug: "modern-living",
    tier: "growth",
    description: "Curated home accents, sculptural lighting, and tactile pieces that turn browsing into aspiration.",
    mood: "Warm gallery interiors",
    audience: "Design-forward households",
    curator: "Noah Bennett",
    productCount: 132,
    activeCollections: 9,
    featuredCount: 24,
    conversion: 3.9,
    growth: 24.4,
    margin: 28,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=60",
    palette: "linear-gradient(135deg, rgba(66, 50, 34, 0.92), rgba(196, 170, 129, 0.78))",
    topPicks: ["Lighting", "Decor", "Dining"],
  },
  {
    id: 3,
    name: "Tech Atelier",
    slug: "tech-atelier",
    tier: "signature",
    description: "High-performance devices and accessories staged with clarity, contrast, and confidence.",
    mood: "Precision and innovation",
    audience: "Early adopters",
    curator: "Ari Patel",
    productCount: 96,
    activeCollections: 7,
    featuredCount: 19,
    conversion: 5.2,
    growth: 16.8,
    margin: 34,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=60",
    palette: "linear-gradient(135deg, rgba(9, 18, 34, 0.95), rgba(30, 111, 102, 0.82))",
    topPicks: ["Wearables", "Audio", "Workspace"],
  },
  {
    id: 4,
    name: "Beauty Rituals",
    slug: "beauty-rituals",
    tier: "seasonal",
    description: "Refined skincare and body care assortments built around ritual, texture, and replenishment.",
    mood: "Soft glow essentials",
    audience: "Self-care loyalists",
    curator: "Leila Mercer",
    productCount: 74,
    activeCollections: 5,
    featuredCount: 14,
    conversion: 4.4,
    growth: 29.1,
    margin: 26,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=60",
    palette: "linear-gradient(135deg, rgba(81, 42, 53, 0.9), rgba(221, 171, 166, 0.76))",
    topPicks: ["Serums", "Bath", "Night Care"],
  },
  {
    id: 5,
    name: "Performance Footwear",
    slug: "performance-footwear",
    tier: "growth",
    description: "Running, training, and recovery silhouettes arranged around movement and measurable gains.",
    mood: "Athletic momentum",
    audience: "Fitness-driven shoppers",
    curator: "Dylan Ross",
    productCount: 118,
    activeCollections: 8,
    featuredCount: 21,
    conversion: 4.6,
    growth: 21.3,
    margin: 29,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=60",
    palette: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(221, 115, 65, 0.82))",
    topPicks: ["Road", "Trail", "Recovery"],
  },
  {
    id: 6,
    name: "Seasonal Gifting",
    slug: "seasonal-gifting",
    tier: "seasonal",
    description: "Occasion-led edits that make discovery faster, richer, and more emotionally persuasive.",
    mood: "Wrapped for delight",
    audience: "Last-minute premium buyers",
    curator: "Nina Cole",
    productCount: 63,
    activeCollections: 4,
    featuredCount: 11,
    conversion: 3.6,
    growth: 33.8,
    margin: 24,
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&auto=format&fit=crop&q=60",
    palette: "linear-gradient(135deg, rgba(43, 25, 21, 0.92), rgba(188, 123, 98, 0.78))",
    topPicks: ["Occasions", "Sets", "Gift Cards"],
  },
];

const formatTier = (tier: CategoryTier) => {
  switch (tier) {
    case "signature":
      return "Signature";
    case "growth":
      return "Growth";
    case "seasonal":
      return "Seasonal";
    default:
      return tier;
  }
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | CategoryTier>("all");

  const spotlight = categoryData[0];

  const stats = useMemo<Stat[]>(() => {
    const totalProducts = categoryData.reduce((sum, category) => sum + category.productCount, 0);
    const averageMargin = categoryData.reduce((sum, category) => sum + category.margin, 0) / categoryData.length;
    const averageGrowth = categoryData.reduce((sum, category) => sum + category.growth, 0) / categoryData.length;

    return [
      {
        label: "Curated Worlds",
        value: categoryData.length.toString().padStart(2, "0"),
        note: "Distinct category experiences",
        Icon: LayoutGrid,
      },
      {
        label: "Live Assortment",
        value: totalProducts.toString(),
        note: "Products mapped to category logic",
        Icon: Package,
      },
      {
        label: "Average Margin",
        value: `${Math.round(averageMargin)}%`,
        note: "Across active category plans",
        Icon: BadgePercent,
      },
      {
        label: "Growth Velocity",
        value: `+${averageGrowth.toFixed(1)}%`,
        note: "Quarter-over-quarter category lift",
        Icon: TrendingUp,
      },
    ];
  }, []);

  const filteredCategories = useMemo(() => {
    return categoryData.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.topPicks.some((pick) => pick.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTier = tierFilter === "all" || category.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [searchTerm, tierFilter]);

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

        <div className="categories-filter">
          <SlidersHorizontal size={18} />
          <select
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value as "all" | CategoryTier)}
          >
            <option value="all">All Tiers</option>
            <option value="signature">Signature</option>
            <option value="growth">Growth</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>

        <div className="categories-toolbar-note">
          <Boxes size={18} />
          <span>{filteredCategories.length} category blueprints visible</span>
        </div>
      </section>

      <section className="categories-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <article key={category.id} className="category-card">
              <div className="category-card-media" style={{ background: category.palette }}>
                <img src={category.image} alt={category.name} />
                <div className="category-card-media-overlay" />
                <div className="category-card-pills">
                  <span>{formatTier(category.tier)}</span>
                  <span>{category.activeCollections} edits</span>
                </div>
              </div>

              <div className="category-card-body">
                <div className="category-card-heading">
                  <div>
                    {/* <span className="category-card-slug">/{category.slug}</span> */}
                    <h3>{category.name}</h3>
                  </div>

                  <button className="category-card-arrow" type="button" aria-label={`Preview ${category.name}`}>
                    <ArrowUpRight size={18} />
                  </button>
                </div>

                <p className="category-card-description">{category.description}</p>

                <div className="category-card-metrics">
                  <div>
                    <span>Products</span>
                    <strong>{category.productCount}</strong>
                  </div>
                  <div>
                    <span>Growth</span>
                    <strong>+{category.growth}%</strong>
                  </div>
                  <div>
                    <span>Margin</span>
                    <strong>{category.margin}%</strong>
                  </div>
                  <div>
                    <span>Featured</span>
                    <strong>{category.featuredCount}</strong>
                  </div>
                </div>

                {/* <div className="category-card-curator">
                  <div>
                    <span>Audience</span>
                    <strong>{category.audience}</strong>
                  </div>
                  <div>
                    <span>Curator</span>
                    <strong>{category.curator}</strong>
                  </div>
                  <div>
                    <span>Conversion</span>
                    <strong>{category.conversion}%</strong>
                  </div>
                </div> */}

                {/* <div className="category-card-tags">
                  {category.topPicks.map((pick) => (
                    <span key={pick}>{pick}</span>
                  ))}
                </div> */}

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
