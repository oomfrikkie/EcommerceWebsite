import { Link } from "react-router-dom";
import "./herobanner.css";

export default function HeroBanner() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-eyebrow">New Season — 2025</p>
        <h1 className="hero-headline">
          Everything<br />you need.
        </h1>
        <p className="hero-sub">
          Premium gear, fresh drops, and everyday essentials — all in one place.
          Free delivery on orders over €50.
        </p>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
          <Link to="/products?category=Sale" className="btn btn-ghost btn-lg">View Sale</Link>
        </div>
      </div>
      <div className="hero-blur" aria-hidden="true" />
    </section>
  );
}
