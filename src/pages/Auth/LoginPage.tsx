import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import { api } from "../../services/api";
import { setAuthToken } from "../../services/authStorage";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/login", {
        email,
        password,
      });

      const token = res.data.token;

      // store JWT
      setAuthToken(token);

      // redirect after login
      navigate("/dashboard");

    } catch (err: any) {
      console.error("Login failed:", err.response?.data ?? err);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Welcome Back</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="divider">Or</div>

        <div className="social-login">
          <button type="button">Sign in with Google</button>
          <button type="button">Sign in with Apple</button>
        </div>

        <p className="switch-auth">
          Don't have an account? <Link to="/">Signup</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;