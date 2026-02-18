import { useState } from "react";
import './login.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      const res = await axios.post("http://localhost:3000/account/login", {
        email,
        password,
      });

      console.log("Successfully logged in", res.data);

    sessionStorage.setItem("account_id", String(res.data.account_id));
sessionStorage.setItem("email", res.data.email);
      

      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-container">
      <div className="form">
        <h2>Login</h2>

        <div className="field">
          <label>Email</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label>Password</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </section>
  );
}
