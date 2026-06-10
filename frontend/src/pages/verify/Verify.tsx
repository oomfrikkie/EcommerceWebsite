import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import "./verify.css";
import { API_BASE_URL } from "../../config";

export default function VerifyAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.get(`${API_BASE_URL}/account/verify/${token}`);
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? "Verification failed") : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card verify-card">
        <div className="verify-icon">{done ? "✓" : "✉️"}</div>
        <h2>{done ? "All set!" : "Verify your email"}</h2>
        <p className="form-sub">
          {done
            ? "Your account is verified. Redirecting you to login…"
            : "Click the button below to confirm your email address and activate your account."}
        </p>

        {error && <p className="form-error">{error}</p>}

        {!done && (
          <button className="btn btn-primary btn-full" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying…" : "Verify Account"}
          </button>
        )}

        <p className="form-hint">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
