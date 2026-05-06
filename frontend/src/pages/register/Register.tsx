import { useState } from "react";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      navigate(`/verify/${data.verification_token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="auth-logo">One<span>Fifty</span></div>
        <h2>Create account</h2>
        <p className="form-sub">Join us — it's free</p>

        {error && <p className="form-error">{error}</p>}

        <div className="register-row">
          <div className="field">
            <label htmlFor="fname">First Name</label>
            <input id="fname" type="text" placeholder="Jane" value={form.first_name} onChange={update("first_name")} />
          </div>
          <div className="field">
            <label htmlFor="lname">Last Name</label>
            <input id="lname" type="text" placeholder="Doe" value={form.last_name} onChange={update("last_name")} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" value={form.password} onChange={update("password")} autoComplete="new-password" />
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p className="form-hint">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
