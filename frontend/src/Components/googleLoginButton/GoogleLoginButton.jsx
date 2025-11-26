import React from "react";

const GoogleLoginButton = () => {
  const backendUrl = import.meta.env.VITE_API_URL_SHORT;

  const handleGoogleLogin = () => {
    // Redirect user to your Django backend's Google login endpoint
    window.location.href = backendUrl + "/accounts/google/login/";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "10px 16px",
        cursor: "pointer",
        fontWeight: "500",
      }}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        width="20"
        height="20"
      />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
