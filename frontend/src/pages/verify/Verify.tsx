import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function VerifyAccount() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      await axios.get(`http://localhost:3000/account/verify/${token}`);
      navigate("/login");
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? "Verification failed") : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="verify-container">
      <h2>Verify your account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify account"}
      </button>
    </section>
  );
}
