import { useState } from "react";
import "./login.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/account/login", { email, password });
      sessionStorage.setItem("account_id", String(res.data.account_id));
      sessionStorage.setItem("email", res.data.email);
      window.dispatchEvent(new Event("auth:updated"));
      navigate("/home");
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? "Login failed") : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="auth-logo">One<span>Fifty</span></div>
        <h2>Welcome back</h2>
        <p className="form-sub">Sign in to your account</p>

        {error && <p className="form-error">{error}</p>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKey}
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="form-hint">
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
