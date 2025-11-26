// src/components/admin/AdminLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import AdminNavbar from "./AdminNavbar";
import { Container } from "react-bootstrap";
import "../../styles/admin-theme.css";
const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: "#f9f9f9" }}>
        {/* <AdminNavbar /> */}

        <Container fluid className="p-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;
