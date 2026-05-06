import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./products.css";

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  image_url?: string;
  categories?: { name: string }[];
}

const CATEGORIES = ["All", "Shoes", "Clothing", "Streetwear", "Sports", "Accessories", "Sale"];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeCategory = searchParams.get("category") ?? "All";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let res;
        if (activeCategory === "All") {
          res = await axios.get("http://localhost:3000/products");
        } else {
          res = await axios.get("http://localhost:3000/products/category/by-name", {
            params: { name: activeCategory },
          });
        }
        setProducts(res.data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeCategory]);

  const setCategory = (cat: string) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <h1 className="page-title">
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h1>
          <p className="page-subtitle">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>

          <div className="products-tabs" role="tablist">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-state">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found in this category.</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div
                key={product.id}
                className="product-tile"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-tile-img">
                  {product.image_url && (
                    <img src={`/${product.image_url}`} alt={product.title} />
                  )}
                </div>
                <div className="product-tile-body">
                  <p className="product-tile-brand">{product.brand}</p>
                  <h3 className="product-tile-title">{product.title}</h3>
                  <p className="product-tile-price">€{Number(product.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
