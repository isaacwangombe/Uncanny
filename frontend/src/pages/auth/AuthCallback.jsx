// src/pages/auth/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query params
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      // Save tokens in localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      window.dispatchEvent(new Event("storage"));

      navigate("/"); // Go back to homepage (or admin if you prefer)
    } else {
      console.warn("❌ No tokens found in URL");
      navigate("/login?error=missing-tokens");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h3>🔄 Logging you in with Google...</h3>
      <p>Please wait...</p>
    </div>
  );
}
