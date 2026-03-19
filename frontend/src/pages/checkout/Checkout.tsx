import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./checkout.css";

interface CartItem {
  id: number;
  product: {
    id: number;
    title: string;
    brand: string;
    description: string;
    price: string;
  };
  quantity: number;
}

interface Cart {
  id: number;
  items: CartItem[];
}

interface PaymentForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  streetAddress: string;
  city: string;
  zipCode: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PaymentForm>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    streetAddress: "",
    city: "",
    zipCode: "",
  });

  useEffect(() => {
    const fetchCart = async () => {
      const accountId = sessionStorage.getItem("account_id");
      if (!accountId) {
        setError("Please log in to checkout");
        setLoading(false);
        return;
      }

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
    () => cart?.items?.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0) || 0,
    [cart]
  );

  const updateField = (field: keyof PaymentForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!cart || !cart.items.length) {
      setError("Your cart is empty");
      return;
    }

    const accountId = sessionStorage.getItem("account_id");
    if (!accountId) {
      setError("Please log in to checkout");
      return;
    }

    setError("");
    setSubmitting(true);

    const orderPayload = {
      account_id: parseInt(accountId, 10),
      amount: total,
      products: cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      await axios.post("http://localhost:3000/orders", orderPayload, { timeout: 5000 });
      await axios.delete(`http://localhost:3000/cart/clear/${accountId}`, { timeout: 5000 });
      setCart((prev) => (prev ? { ...prev, items: [] } : prev));
      window.dispatchEvent(new Event("cart:updated"));
      alert("Payment successful and order placed!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Failed to complete checkout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <h1>Checkout</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="checkout-error">{error}</p>}

        {!loading && (
          <div className="checkout-grid">
            <div className="order-card">
              <h2>Order Details</h2>
              <div className="order-list">
                {cart?.items?.length ? (
                  cart.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-text">
                        <h3>{item.product.title}</h3>
                        <p>{item.product.brand}</p>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <p className="order-item-price">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>Your cart is empty</p>
                )}
              </div>
              <div className="order-total">Total: ${total.toFixed(2)}</div>
            </div>

            <form className="payment-card" onSubmit={handlePlaceOrder}>
              <h2>Payment Details</h2>

              <label>
                Name on Card
                <input
                  type="text"
                  value={form.cardName}
                  onChange={(e) => updateField("cardName", e.target.value)}
                  required
                />
              </label>

              <label>
                Card Number
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={form.cardNumber}
                  onChange={(e) => updateField("cardNumber", e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </label>

              <div className="payment-row">
                <label>
                  Expiry
                  <input
                    type="text"
                    maxLength={5}
                    value={form.expiry}
                    onChange={(e) => updateField("expiry", e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                </label>

                <label>
                  CVV
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={form.cvv}
                    onChange={(e) => updateField("cvv", e.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                Street Address
                <input
                  type="text"
                  value={form.streetAddress}
                  onChange={(e) => updateField("streetAddress", e.target.value)}
                  required
                />
              </label>

              <div className="payment-row">
                <label>
                  City
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    required
                  />
                </label>

                <label>
                  ZIP Code
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    required
                  />
                </label>
              </div>

              <button className="checkout-button" type="submit" disabled={submitting || !cart?.items?.length}>
                {submitting ? "Processing..." : "Complete Payment"}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
