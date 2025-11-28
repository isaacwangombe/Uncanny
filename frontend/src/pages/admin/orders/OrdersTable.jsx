import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import "../../../styles/admin-theme.css";

const statusColors = {
  pending: "warning",
  paid: "success",
  shipped: "info",
  completed: "primary",
  cancelled: "secondary",
  refunded: "dark",
};

const OrdersTable = ({ orders, onView }) => {
  return (
    <div className="table-responsive">
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.length ? (
            orders.map((o) => {
              const customerEmail =
                o.shipping_address?.email || o.user?.email || "Guest";

              return (
                <tr key={o.id}>
                  <td data-label="Order ID">#{o.id}</td>
                  <td data-label="Email">{customerEmail}</td>
                  <td data-label="Phone">
                    {o.shipping_address?.phone || o.phone_number || "—"}
                  </td>
                  <td data-label="Status">
                    <Badge bg={statusColors[o.status] || "secondary"}>
                      {o.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td data-label="Total">
                    KES {Number(o.total || 0).toFixed(2)}
                  </td>
                  <td data-label="Date">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td data-label="Items">{o.items?.length || 0}</td>
                  <td data-label="Actions">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => onView(o)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="text-center text-muted">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OrdersTable;
