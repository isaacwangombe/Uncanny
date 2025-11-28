import React, { useEffect, useState } from "react";
import { Button, Container, Form, Row, Col, Spinner } from "react-bootstrap";
import { apiGetOrders } from "../../../api";
import OrdersTable from "./OrdersTable";
import OrderDetailsModal from "./OrderDetailsModal";
import "../../../styles/admin-theme.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiGetOrders();
      setOrders(data);
    } catch (err) {
      console.error("❌ Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = (orders || [])
    .filter((o) => {
      return (
        (!statusFilter || o.status === statusFilter) &&
        (!search ||
          o.id.toString().includes(search) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3 g-2 flex-wrap">
        <Col>
          <h4>Orders</h4>
        </Col>
        <Col xs={12} md={3}>
          <Form.Control
            placeholder="Search by order ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={12} md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onView={(order) => {
            setSelectedOrder(order);
            setShowDetailModal(true);
          }}
        />
      )}

      <OrderDetailsModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        order={selectedOrder}
      />
    </Container>
  );
};

export default OrdersPage;
