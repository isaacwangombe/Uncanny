import React, { useState } from "react";
import { Modal, Row, Col, Badge, Button, Table } from "react-bootstrap";
import "../../../styles/admin-theme.css";

const OrderDetailsModal = ({ show, onHide, order, backendUrl }) => {
  const [expandedImage, setExpandedImage] = useState(null);

  if (!order) return null;

  // Helper function to render the address neatly
  const renderAddress = (addr) => {
    if (!addr) return <span className="text-muted">No address provided</span>;
    if (typeof addr === "string") return <div>{addr}</div>;
    if (typeof addr === "object") {
      return (
        <div>
          {addr.street && (
            <div>
              🏠 <strong>Street:</strong> {addr.street}
            </div>
          )}
          {addr.city && (
            <div>
              🌆 <strong>City:</strong> {addr.city}
            </div>
          )}
          {addr.state && (
            <div>
              🏙️ <strong>State:</strong> {addr.state}
            </div>
          )}
          {addr.country && (
            <div>
              🌍 <strong>Country:</strong> {addr.country}
            </div>
          )}
          {addr.postal_code && (
            <div>
              📮 <strong>Postal Code:</strong> {addr.postal_code}
            </div>
          )}
          {addr.landmark && (
            <div>
              📍 <strong>Landmark:</strong> {addr.landmark}
            </div>
          )}
        </div>
      );
    }
    return <span className="text-muted">No address data</span>;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details — #{order.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-3">
            Status:{" "}
            <Badge
              bg={
                {
                  pending: "warning",
                  paid: "success",
                  shipped: "info",
                  completed: "primary",
                  cancelled: "secondary",
                  refunded: "dark",
                }[order.status] || "light"
              }
            >
              {order.status.toUpperCase()}
            </Badge>
          </h5>

          <Row className="mb-4">
            <Col md={6}>
              <p>
                <strong>Total:</strong> ${Number(order.total || 0).toFixed(2)}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Phone Number:</strong> {order.phone_number || "—"}
              </p>
            </Col>
            <Col md={6}>
              <h6 className="fw-semibold">Shipping Address</h6>
              <div className="p-2 border rounded bg-light small">
                {renderAddress(order.shipping_address)}
              </div>
            </Col>
          </Row>

          <hr />

          <h6 className="fw-semibold mb-3">Ordered Items</h6>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length ? (
                order.items.map((item) => {
                  const product = item.product || {};
                  const imageUrl = product.images?.[0]?.image?.startsWith(
                    "http"
                  )
                    ? product.images[0].image
                    : backendUrl + (product.images?.[0]?.image || "");

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={product.title}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                              }}
                            />
                          )}
                          <div>{product.title}</div>
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                      <td>${Number(item.subtotal || 0).toFixed(2)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Expanded image modal */}
      <Modal
        show={!!expandedImage}
        onHide={() => setExpandedImage(null)}
        centered
        size="xl"
        contentClassName="bg-transparent border-0 shadow-none"
      >
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            minHeight: "90vh",
            background: "rgba(0,0,0,0.9)",
            borderRadius: "12px",
          }}
          onClick={() => setExpandedImage(null)}
        >
          <Button
            variant="light"
            size="sm"
            className="position-absolute top-0 end-0 m-3"
            onClick={() => setExpandedImage(null)}
          >
            ×
          </Button>
          {expandedImage && (
            <img
              src={expandedImage}
              alt="Expanded"
              style={{
                maxWidth: "95%",
                maxHeight: "90vh",
                borderRadius: "12px",
                boxShadow: "0 0 20px rgba(255,255,255,0.2)",
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default OrderDetailsModal;
