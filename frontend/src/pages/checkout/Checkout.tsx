import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./checkout.css";

interface CartItem {
  id: number;
  product: { id: number; title: string; brand: string; price: string; image_url?: string };
  quantity: number;
}

interface Cart { id: number; items: CartItem[]; }

interface PaymentForm {
  cardName: string; cardNumber: string; expiry: string; cvv: string;
  streetAddress: string; city: string; zipCode: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PaymentForm>({
    cardName: "", cardNumber: "", expiry: "", cvv: "",
    streetAddress: "", city: "", zipCode: "",
  });

  useEffect(() => {
    const fetchCart = async () => {
      const accountId = sessionStorage.getItem("account_id");
      if (!accountId) { setLoading(false); return; }
      try {
        const res = await axios.get(`http://localhost:3000/cart/${accountId}`, { timeout: 5000 });
        setCart(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const total = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0) ?? 0,
    [cart]
  );

  const set = (key: keyof PaymentForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items?.length) { setError("Your cart is empty"); return; }
    const accountId = sessionStorage.getItem("account_id");
    if (!accountId) { setError("Please log in to checkout"); return; }
    setError("");
    setSubmitting(true);
    try {
      await axios.post("http://localhost:3000/orders", {
        account_id: parseInt(accountId, 10),
        amount: total,
        products: cart.items.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
        status: "paid",
      }, { timeout: 8000 });
      await axios.delete(`http://localhost:3000/cart/clear/${accountId}`, { timeout: 5000 });
      window.dispatchEvent(new Event("cart:updated"));
      navigate("/account");
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const accountId = sessionStorage.getItem("account_id");
  if (!accountId) {
    return (
      <div className="checkout-page container">
        <div className="empty-state">
          Please <Link to="/login" style={{ color: "var(--color-accent)" }}>log in</Link> to checkout.
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        {error && <p className="form-error" style={{ marginBottom: "1.25rem" }}>{error}</p>}

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : (
          <div className="checkout-grid">
            {/* Order summary */}
            <aside className="checkout-summary">
              <h2 className="checkout-section-heading">Order Summary</h2>
              <div className="checkout-items">
                {cart?.items?.length ? cart.items.map(item => (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-img">
                      {item.product.image_url
                        ? <img src={`/${item.product.image_url}`} alt={item.product.title} />
                        : <div className="img-placeholder" />
                      }
                    </div>
                    <div className="checkout-item-info">
                      <p className="checkout-item-title">{item.product.title}</p>
                      <p className="checkout-item-meta">{item.product.brand} · Qty {item.quantity}</p>
                    </div>
                    <p className="checkout-item-price">
                      €{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                )) : <p className="empty-state" style={{ padding: "2rem 0" }}>Cart is empty</p>}
              </div>
              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Delivery</span>
                  <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                    {total >= 50 ? "Free" : "€4.99"}
                  </span>
                </div>
                <div className="checkout-total-row checkout-grand-total">
                  <span>Total</span>
                  <span>€{(total + (total >= 50 ? 0 : 4.99)).toFixed(2)}</span>
                </div>
              </div>
            </aside>

            {/* Payment form */}
            <form className="checkout-form" onSubmit={handlePlaceOrder}>
              <h2 className="checkout-section-heading">Delivery</h2>
              <div className="field">
                <label>Street Address</label>
                <input type="text" placeholder="123 Main Street" value={form.streetAddress} onChange={set("streetAddress")} required />
              </div>
              <div className="checkout-row">
                <div className="field">
                  <label>City</label>
                  <input type="text" placeholder="Amsterdam" value={form.city} onChange={set("city")} required />
                </div>
                <div className="field">
                  <label>ZIP Code</label>
                  <input type="text" placeholder="1234 AB" value={form.zipCode} onChange={set("zipCode")} required />
                </div>
              </div>

              <h2 className="checkout-section-heading" style={{ marginTop: "1.5rem" }}>Payment</h2>
              <div className="card-visual">
                <span className="card-chip" />
                <span className="card-number-preview">
                  {form.cardNumber || "•••• •••• •••• ••••"}
                </span>
                <span className="card-name-preview">{form.cardName || "CARD HOLDER"}</span>
              </div>

              <div className="field">
                <label>Name on Card</label>
                <input type="text" placeholder="Jane Doe" value={form.cardName} onChange={set("cardName")} required />
              </div>
              <div className="field">
                <label>Card Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={set("cardNumber")}
                  required
                />
              </div>
              <div className="checkout-row">
                <div className="field">
                  <label>Expiry</label>
                  <input type="text" maxLength={5} placeholder="MM/YY" value={form.expiry} onChange={set("expiry")} required />
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input type="password" inputMode="numeric" maxLength={4} placeholder="•••" value={form.cvv} onChange={set("cvv")} required />
                </div>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                type="submit"
                disabled={submitting || !cart?.items?.length}
                style={{ marginTop: "1rem" }}
              >
                {submitting ? "Placing order…" : `Pay €${(total + (total >= 50 ? 0 : 4.99)).toFixed(2)}`}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.75rem" }}>
                🔒 This is a demo — no real payment is processed
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
