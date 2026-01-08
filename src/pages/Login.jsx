import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await axios.post("http://localhost:4000/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);

      // Attach token to all future axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Invalid email or password");
    }
  }

  return (
    <div style={{
      padding: 40,
      maxWidth: 400,
      margin: "60px auto",
      border: "1px solid #ddd",
      borderRadius: 10,
      textAlign: "center"
    }}>
      <h1>Admin Login</h1>

      {errorMsg && (
        <p style={{ color: "red" }}>{errorMsg}</p>
      )}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, marginBottom: 15 }}
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, marginBottom: 15 }}
          required
        />

        <button
          type="submit"
          style={{
            padding: 12,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
