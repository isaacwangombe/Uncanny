// src/pages/login/Login.jsx
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import AuthCard from "../../Components/authcard/AuthCard";
import { loginUser, apiGoogleLoginRedirect } from "../../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Handle normal email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Try JWT login using username/email + password
      const data = await loginUser(email, password);
      console.log("✅ Logged in:", data);

      // redirect after login
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google login redirect (handled by backend)
  const handleGoogleLogin = async () => {
    try {
      apiGoogleLoginRedirect();
    } catch (err) {
      console.error("❌ Google login redirect failed:", err);
      setError("Failed to start Google login.");
    }
  };

  return (
    <AuthCard title="Welcome Back">
      <Form onSubmit={handleSubmit}>
        {error && <div className="text-danger mb-3">{error}</div>}

        {/* Email Field */}
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email or Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        {/* Password Field */}
        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        {/* Submit Button */}
        <Button
          variant="dark"
          type="submit"
          className="w-100 mb-3"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Google Login */}
        <Button
          variant="outline-dark"
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            width="18"
            className="me-2"
          />
          Sign in with Google
        </Button>
      </Form>
    </AuthCard>
  );
};

export default Login;
