import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import { api } from "../../services/api";
import { setAuthToken } from "../../services/authStorage";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/register", {
        name,
        email,
        password,
      });

      const token = res.data.token;

      // store token
      setAuthToken(token);

      // redirect
      navigate("/dashboard");

    } catch (err: any) {
      console.error("Register failed:", err.response?.data ?? err);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Get Started Now</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email address</label>
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

        <div className="terms">
          <input type="checkbox" />
          <span>
            I agree to the <a href="#">terms & policy</a>
          </span>
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>

        <div className="divider">Or</div>

        <div className="social-login">
          <button type="button">Sign in with Google</button>
          <button type="button">Sign in with Apple</button>
        </div>

        <p className="switch-auth">
          Have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;