import { useState } from "react";
import "./register.css";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: name,
          last_name: surname,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // ✅ redirect to verify page with token
      navigate(`/verify/${data.verification_token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-container">
      <div className="form">
        <h2>Register</h2>

        <div className="field">
          <label>Name</label>
          <input type="text" onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>Surname</label>
          <input type="text" onChange={(e) => setSurname(e.target.value)} />
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label>Password</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </div>
    </section>
  );
}
