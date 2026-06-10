import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./cart.css";
import { API_BASE_URL } from "../../config";

interface CartItem {
  id: number;
  product: { id: number; title: string; brand: string; price: string; image_url?: string };
  quantity: number;
}

interface Cart {
  id: number;
  items: CartItem[];
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const accountId = sessionStorage.getItem("account_id");

  const fetchCart = async () => {
    if (!accountId) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_BASE_URL}/cart/${accountId}`, { timeout: 5000 });
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleDelete = async (cartItemId: number) => {
    setDeletingId(cartItemId);
    try {
      await axios.delete(`${API_BASE_URL}/cart/item/${cartItemId}`);
      await fetchCart();
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      console.error(err);
      setError("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const total = cart?.items?.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0
  ) ?? 0;

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  if (!accountId) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <p>Please <Link to="/login" style={{ color: "var(--color-accent)" }}>log in</Link> to view your cart.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Your Cart</h1>
        {itemCount > 0 && (
          <p className="page-subtitle">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
        )}

        {error && <p className="form-error" style={{ marginBottom: "1rem" }}>{error}</p>}

        {loading ? (
          <div className="loading-state">Loading cart…</div>
        ) : !cart?.items?.length ? (
          <div className="cart-empty">
            <p className="cart-empty-msg">Your cart is empty.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    {item.product.image_url
                      ? <img src={`/${item.product.image_url}`} alt={item.product.title} />
                      : <div className="img-placeholder" />
                    }
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-brand">{item.product.brand}</p>
                    <h3 className="cart-item-title">{item.product.title}</h3>
                    <p className="cart-item-unit">€{parseFloat(item.product.price).toFixed(2)} each</p>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-qty">Qty: {item.quantity}</p>
                    <p className="cart-item-subtotal">
                      €{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                    <button
                      className="cart-remove-btn"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "…" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2 className="cart-summary-title">Order Summary</h2>
              <div className="cart-summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery</span>
                <span className="cart-free">{total >= 50 ? "Free" : "€4.99"}</span>
              </div>
              {total < 50 && (
                <p className="cart-delivery-hint">
                  Add €{(50 - total).toFixed(2)} more for free delivery
                </p>
              )}
              <div className="cart-summary-total">
                <span>Total</span>
                <span>€{(total + (total >= 50 ? 0 : 4.99)).toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
              <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: "0.5rem" }}>
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
