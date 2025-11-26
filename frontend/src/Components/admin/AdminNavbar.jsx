// src/components/admin/AdminNavbar.jsx
import React, { useEffect, useState } from "react";
import { Navbar, Container, Spinner, Button, Nav } from "react-bootstrap";
import { fetchCurrentUser, logoutUser } from "../../api";
import "../../styles/admin-theme.css";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const AdminNavbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      window.location.href = FRONTEND_URL + "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="border-bottom shadow-sm py-2">
      <Container fluid className="justify-content-between">
        <Navbar.Brand className="fw-bold">🧠 Uncanny Valley Admin</Navbar.Brand>

        <Nav className="align-items-center">
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : user ? (
            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <div className="fw-semibold">
                  {user.first_name || user.username || user.email}
                </div>
                <div className="small text-muted">{user.role}</div>
              </div>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={handleLogout}
                className="ms-2"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Not logged in</span>
              <Button
                variant="dark"
                size="sm"
                onClick={() => (window.location.href = FRONTEND_URL + "/login")}
              >
                Login
              </Button>
            </div>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
