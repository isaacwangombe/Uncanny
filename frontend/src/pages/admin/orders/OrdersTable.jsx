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
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer Email</th> {/* ✅ NEW LABEL */}
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
            // ✅ ALWAYS prioritise shipping email
            const customerEmail =
              o.shipping_address?.email || o.user?.email || "Guest";

            return (
              <tr key={o.id}>
                <td>#{o.id}</td>

                {/* CUSTOMER EMAIL */}
                <td>{customerEmail}</td>

                {/* PHONE */}
                <td>{o.shipping_address?.phone || o.phone_number || "—"}</td>

                {/* STATUS */}
                <td>
                  <Badge bg={statusColors[o.status] || "secondary"}>
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </Badge>
                </td>

                {/* TOTAL */}
                <td>KES {Number(o.total || 0).toFixed(2)}</td>

                {/* DATE */}
                <td>{new Date(o.created_at).toLocaleString()}</td>

                {/* ITEM COUNT */}
                <td>{o.items?.length || 0}</td>

                {/* ACTIONS */}
                <td>
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
  );
};

export default OrdersTable;
