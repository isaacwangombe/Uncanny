import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Container } from "react-bootstrap";
import "../../styles/admin-theme.css";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Mobile top bar */}
        <div className="d-md-none p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
          <button d-md-block
            className="btn btn-outline-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <strong>Admin Panel</strong>
        </div>

        <Container fluid className="p-3 p-md-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;
