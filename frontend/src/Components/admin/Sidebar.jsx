import React from "react";
import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaTags,
  FaUsers,
  FaShoppingCart,
  FaQrcode,
  FaEnvelope,
  FaMailBulk,
  FaTimes,
} from "react-icons/fa";
import "../../styles/admin-theme.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = window.innerWidth >= 768;

  const links = [
    { path: "/staff/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/staff/products", label: "Products", icon: <FaBoxOpen /> },
    { path: "/staff/categories", label: "Categories", icon: <FaTags /> },
    { path: "/staff/users", label: "Users", icon: <FaUsers /> },
    { path: "/staff/orders", label: "Orders", icon: <FaShoppingCart /> },
    { path: "/staff/scan", label: "QR Scanner", icon: <FaQrcode /> },
    { path: "/staff/messages", label: "Messages", icon: <FaEnvelope /> },
    {
      path: "/staff/mailing-list",
      label: "Mailing List",
      icon: <FaMailBulk />,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && !isDesktop && (
        <div
          className="d-md-none"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1040,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          minHeight: "100vh",
          width: "250px",
          background: "linear-gradient(180deg, #0f172a, #111827)",
          color: "#e5e7eb",
          position: isDesktop ? "sticky" : "fixed",
          left: isDesktop ? "0" : isOpen ? "0" : "-260px",
          top: 0,
          // zIndex: 1050,
          transition: "left 0.3s ease",
          boxShadow: "2px 0 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile Close */}
        {!isDesktop && (
          <div className="d-flex justify-content-end p-3">
            <button className="btn btn-sm btn-outline-light" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* Logo / Title */}
        <div className="px-3 pb-4 mt-5 text-center">
          <h4 className="fw-bold mb-1">Admin Panel</h4>
          <small className="text-muted">Control Center</small>
        </div>

        {/* Nav Links */}
        <Nav className="flex-column px-2">
          {links.map((link) => {
            const active = location.pathname === link.path;

            return (
              <Nav.Link
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  onClose?.();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  marginBottom: "6px",
                  borderRadius: "12px",
                  color: active ? "#fff" : "#c7d2fe",
                  background: active
                    ? "linear-gradient(90deg, #4f46e5, #0a84ff)"
                    : "transparent",
                  fontWeight: active ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="sidebar-link"
              >
                <span style={{ fontSize: "16px" }}>{link.icon}</span>
                <span>{link.label}</span>
              </Nav.Link>
            );
          })}
        </Nav>

        {/* Footer */}
        <div className="mt-auto p-3 text-center small text-muted">
          v1.0 Admin
        </div>
      </div>

      {/* Desktop spacer */}
      {/* <div className="d-none d-md-block" style={{ width: "250px" }} /> */}
    </>
  );
};

export default Sidebar;
