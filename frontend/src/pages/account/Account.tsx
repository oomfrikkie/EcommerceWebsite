import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./account.css";

interface Account {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface OrderProduct {
  id: number;
  title: string;
  price: number;
}

interface Order {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  products?: OrderProduct[];
}

export default function Account() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const accountId = sessionStorage.getItem("account_id");

  useEffect(() => {
    if (!accountId) { navigate("/login"); return; }

    const fetchAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/account/${accountId}`);
        setAccount(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAccount(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/orders/account/${accountId}`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchAccount();
    fetchOrders();
  }, [accountId, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("account_id");
    sessionStorage.removeItem("email");
    window.dispatchEvent(new Event("auth:updated"));
    navigate("/home");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const statusColor = (status: string) => {
    if (status === "paid") return "var(--color-success)";
    if (status === "pending") return "#f59e0b";
    return "var(--color-muted)";
  };

  if (!accountId) return null;

  return (
    <div className="account-page">
      <div className="container">
        {/* Profile header */}
        <div className="account-header">
          <div className="account-avatar">
            {account ? account.first_name[0].toUpperCase() : "?"}
          </div>
          <div className="account-meta">
            {loadingAccount ? (
              <p className="account-name-loading">Loading…</p>
            ) : (
              <>
                <h1 className="account-name">
                  {account?.first_name} {account?.last_name}
                </h1>
                <p className="account-email">{account?.email}</p>
              </>
            )}
          </div>
          <button className="btn btn-outline btn-sm account-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="account-grid">
          {/* Profile card */}
          <div className="account-card">
            <h2 className="account-card-title">Profile</h2>
            {loadingAccount ? (
              <div className="loading-state" style={{ padding: "1.5rem 0" }}>Loading…</div>
            ) : (
              <div className="account-details">
                <div className="account-detail-row">
                  <span className="account-detail-label">First Name</span>
                  <span>{account?.first_name}</span>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Last Name</span>
                  <span>{account?.last_name}</span>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Email</span>
                  <span>{account?.email}</span>
                </div>
              </div>
            )}
            <Link to="/products" className="btn btn-primary btn-full" style={{ marginTop: "1.5rem" }}>
              Continue Shopping
            </Link>
          </div>

          {/* Orders */}
          <div className="account-orders">
            <h2 className="account-card-title">
              Order History
              {orders.length > 0 && (
                <span className="order-count">{orders.length}</span>
              )}
            </h2>

            {loadingOrders ? (
              <div className="loading-state">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="orders-empty">
                <p>No orders yet.</p>
                <Link to="/products" className="btn btn-outline btn-sm">Shop Now</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-top">
                      <div>
                        <p className="order-id">Order #{order.id}</p>
                        <p className="order-date">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="order-right">
                        <p className="order-amount">€{Number(order.amount).toFixed(2)}</p>
                        <span
                          className="order-status"
                          style={{ color: statusColor(order.status) }}
                        >
                          {order.status ?? "pending"}
                        </span>
                      </div>
                    </div>
                    {order.products && order.products.length > 0 && (
                      <div className="order-products">
                        {order.products.map(p => (
                          <span key={p.id} className="order-product-chip">{p.title}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
