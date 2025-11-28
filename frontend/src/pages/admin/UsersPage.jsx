import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  Badge,
  Collapse,
} from "react-bootstrap";

import { getUsers, toggleStaff, promoteToOwner, api } from "../../apiAdmin";
import { apiFetch } from "../../api";
import "../../styles/admin-theme.css";

const UsersPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visitorStats, setVisitorStats] = useState({ daily: 0, monthly: 0 });
  const [showCustomers, setShowCustomers] = useState(false);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerResults, setCustomerResults] = useState([]);
  const [searchCustomers, setSearchCustomers] = useState([]);
  const [customerHasMore, setCustomerHasMore] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const load = async () => {
    setLoading(true);

    const [userRes, visitorRes, currentRes] = await Promise.all([
      getUsers(),
      apiFetch("/admin/analytics/visitors/"),
      api.get("/auth/user/"),
    ]);

    setAllUsers(userRes);
    setVisitorStats(visitorRes);
    setCurrentUser(currentRes.data);
    setLoading(false);
  };

  const loadCustomers = async (page = 1) => {
    setLoadingCustomers(true);
    try {
      const res = await api.get("/admin/users/", { params: { page } });
      const customers = res.data.filter((u) => u.role === "Customer");
      setCustomerResults((prev) =>
        page === 1 ? customers : [...prev, ...customers]
      );
      setCustomerHasMore(customers.length >= 10);
      setCustomerPage(page);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (!query.trim()) {
      setSearchCustomers([]);
      return;
    }

    try {
      const res = await api.get("/admin/users/", { params: { search: query } });
      const customers = res.data.filter((u) => u.role === "Customer");
      setSearchCustomers(customers);
    } catch (err) {
      console.error("Failed to search customers:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStaff = async (id) => {
    await toggleStaff(id);
    load();
  };

  const handlePromoteOwner = async (id) => {
    try {
      await promoteToOwner(id);
      load();
    } catch (err) {
      console.error("❌ Owner promotion failed:", err);
    }
  };

  const groupByRole = (role) =>
    allUsers.filter(
      (u) =>
        u.role === role &&
        (u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()))
    );

  const superadmins = groupByRole("Superadmin");
  const owners = groupByRole("Owner");
  const staff = groupByRole("Staff");

  const renderTable = (title, users, allowActions = true) => (
    <>
      <h5 className="mt-4">{title}</h5>

      {users.length > 0 ? (
        <div className="table-responsive">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                {allowActions && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {users.map((u) => {
                const canEdit =
                  allowActions &&
                  currentUser &&
                  (currentUser.is_superuser || currentUser.role === "Owner") &&
                  currentUser.pk !== u.pk;

                return (
                  <tr key={u.id || u.pk}>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Username">{u.username}</td>
                    <td data-label="Role">{u.role}</td>
                    <td data-label="Status">
                      {u.is_staff ? "✅ Staff" : "❌ User"}
                    </td>

                    {allowActions && (
                      <td data-label="Actions">
                        {canEdit && (
                          <Button
                            variant={u.is_staff ? "warning" : "success"}
                            size="sm"
                            className="me-2 mb-1"
                            onClick={() => handleToggleStaff(u.id)}
                          >
                            {u.is_staff ? "Remove Staff" : "Make Staff"}
                          </Button>
                        )}

                        {currentUser?.is_superuser &&
                          currentUser.pk !== u.pk && (
                            <Button
                              variant={
                                u.role === "Owner" ? "secondary" : "info"
                              }
                              size="sm"
                              className="mb-1"
                              onClick={() => handlePromoteOwner(u.id)}
                            >
                              {u.role === "Owner"
                                ? "Remove Owner"
                                : "Make Owner"}
                            </Button>
                          )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <p className="text-muted">No {title.toLowerCase()} found.</p>
      )}
    </>
  );

  if (loading)
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" />
      </div>
    );

  const showSuperadmins = currentUser && currentUser.is_superuser;

  return (
    <div className="p-4">
      <Row className="align-items-center mb-3 g-2">
        <Col xs={12} md={6}>
          <h3>Users</h3>
        </Col>
        <Col xs={12} md={6} className="text-md-end">
          <Badge bg="primary" className="me-2">
            Daily Visitors: {visitorStats.daily}
          </Badge>
          <Badge bg="info">Monthly Visitors: {visitorStats.monthly}</Badge>
        </Col>
      </Row>

      <Row className="mb-3 g-2">
        <Col xs={12} md={4}>
          <Form.Control
            placeholder="Search by username or email..."
            value={search}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      {showSuperadmins && renderTable("Superadmins", superadmins)}
      {renderTable("Owners", owners)}
      {renderTable("Staff", staff)}

      {searchCustomers.length > 0 && (
        <>
          <h5 className="mt-4">Customer Search Results</h5>
          {renderTable("Search Matches", searchCustomers)}
        </>
      )}

      <div className="mt-4">
        <Button
          variant="outline-primary"
          onClick={async () => {
            if (!showCustomers && customerResults.length === 0)
              await loadCustomers();
            setShowCustomers((prev) => !prev);
          }}
        >
          {showCustomers ? "Hide All Customers" : "Show All Customers"}
        </Button>

        <Collapse in={showCustomers}>
          <div>
            <h5 className="mt-3">All Customers</h5>

            {loadingCustomers ? (
              <div className="text-center py-3">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                {customerResults.length > 0 ? (
                  renderTable("Customers", customerResults)
                ) : (
                  <p className="text-muted">No customers found.</p>
                )}

                {customerHasMore && (
                  <div className="text-center mt-3">
                    <Button
                      onClick={() => loadCustomers(customerPage + 1)}
                      disabled={loadingCustomers}
                    >
                      {loadingCustomers ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default UsersPage;
