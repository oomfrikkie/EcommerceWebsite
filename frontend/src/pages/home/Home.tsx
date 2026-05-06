import { Link } from "react-router-dom";
import HeroBanner from "../../components/herobanner/HeroBanner";
import ProductScroller from "../../components/product-scroller/ProductScroller";
import "./home.css";

const CATEGORIES = [
  { name: "Shoes", emoji: "👟" },
  { name: "Clothing", emoji: "👕" },
  { name: "Streetwear", emoji: "🧢" },
  { name: "Sports", emoji: "⚽" },
  { name: "Accessories", emoji: "🎒" },
  { name: "Sale", emoji: "🏷️" },
];

export default function Home() {
  return (
    <div className="home">
      <HeroBanner />

      <section className="home-categories">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="category-card"
              >
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-scrollers">
        <div className="container">
          <div className="scroller-header">
            <h2 className="section-title">Shoes</h2>
            <Link to="/products?category=Shoes" className="see-all">See all →</Link>
          </div>
          <ProductScroller category="Shoes" />

          <div className="scroller-header">
            <h2 className="section-title">Clothing</h2>
            <Link to="/products?category=Clothing" className="see-all">See all →</Link>
          </div>
          <ProductScroller category="Clothing" />

          <div className="scroller-header">
            <h2 className="section-title">Sports</h2>
            <Link to="/products?category=Sports" className="see-all">See all →</Link>
          </div>
          <ProductScroller category="Sports" />
        </div>
      </section>
    </div>
  );
}
