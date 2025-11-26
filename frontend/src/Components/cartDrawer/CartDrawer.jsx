import React, { useMemo } from "react";
import { Offcanvas, Button, ListGroup, Row, Col } from "react-bootstrap";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { optimizeImage } from "../../utils/cloudinary";

const formatKES = (v) => `Kes ${Number(v || 0).toFixed(2)}`;

const CartDrawer = ({ show, onClose }) => {
  const { cart, loading, increase, decrease, removeItem } = useCart();

  // FIX: hooks must run BEFORE any conditional return
  const items = useMemo(() => cart?.items ?? [], [cart]);

  // Safe after hooks
  if (loading) return null;

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Your Cart</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {items.length === 0 ? (
          <div className="text-center text-muted py-4">Your cart is empty.</div>
        ) : (
          <ListGroup variant="flush">
            {items.map((it) => {
              const raw = it.product?.images?.[0]?.image;
              const imgUrl = raw
                ? optimizeImage(raw, 150)
                : "https://via.placeholder.com/150?text=No+Image";

              return (
                <ListGroup.Item key={it.id}>
                  <Row className="align-items-center">
                    <Col xs={3}>
                      <img
                        src={imgUrl}
                        alt={it.product?.title}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    </Col>

                    <Col xs={6}>
                      <div className="fw-semibold">{it.product?.title}</div>
                      <div className="text-muted small">
                        {formatKES(it.unit_price)}
                      </div>
                    </Col>

                    <Col xs={3} className="text-end">
                      <div className="d-flex flex-column align-items-end">
                        <div className="mb-1">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() =>
                              decrease({ product_id: it.product.id })
                            }
                          >
                            −
                          </Button>
                          <span className="px-2">{it.quantity}</span>
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() =>
                              increase({ product_id: it.product.id })
                            }
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => removeItem(it.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}

        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-muted">Subtotal</div>
            <div className="fw-bold">{formatKES(cart?.total)}</div>
          </div>

          <div className="d-grid gap-2">
            <Link to="/checkout" onClick={onClose}>
              <Button variant="dark">Checkout</Button>
            </Link>

            <Button variant="outline-secondary" onClick={onClose}>
              Continue shopping
            </Button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default React.memo(CartDrawer);
