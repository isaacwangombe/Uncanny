import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Card,
  ListGroup,
} from "react-bootstrap";
import { apiCartCheckout, fetchCurrentUser } from "../../api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { optimizeImage } from "../../utils/cloudinary";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const {
    cart,
    loading: cartLoading,
    increase,
    decrease,
    removeItem,
  } = useCart();

  const [address, setAddress] = useState({ street: "", city: "", country: "" });
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const current = await fetchCurrentUser();
        if (current) {
          setUser(current);
          setFirstName(current.first_name || "");
          setLastName(current.last_name || "");
          setEmail(current.email || "");
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    loadUser();
  }, []);

  // IMPORTANT FIX:
  // Hooks MUST run before any conditional return.
  const items = useMemo(() => (cart ? cart.items || [] : []), [cart]);

  const getPrice = (p) => Number(p?.discounted_price ?? p?.price ?? 0);

  const subtotal = items.reduce(
    (sum, it) => sum + getPrice(it.product) * it.quantity,
    0
  );

  // After hooks run, THEN we can return early
  if (cartLoading || !cart) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // Submit checkout form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        shipping_address: {
          ...address,
          email, // ✅ <-- THIS MAKES GUEST CHECKOUT WORK
          first_name: firstName,
          last_name: lastName,
        },
        phone_number: phone,
      };

      const res = await apiCartCheckout(payload);
      window.location.href = res.payment_url;
    } catch (err) {
      console.error(err);
      setMessage("❌ Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <h3 className="mb-4">Checkout</h3>

      <Row className="g-4">
        {/* LEFT COLUMN: CART ITEMS */}
        <Col lg={6}>
          <Card className="p-3">
            <h5 className="mb-3">Your Items</h5>

            <ListGroup variant="flush">
              {items.map((it) => {
                const img =
                  optimizeImage(it.product?.images?.[0]?.image, 200) ||
                  "https://via.placeholder.com/150?text=Image";

                return (
                  <ListGroup.Item key={it.id}>
                    <Row className="align-items-center">
                      <Col xs={3}>
                        <img
                          src={img}
                          alt={it.product?.title}
                          className="w-100"
                          style={{
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      </Col>

                      <Col xs={6}>
                        <strong>{it.product?.title}</strong>
                        <div className="text-muted small">
                          Kes {getPrice(it.product).toFixed(2)}
                        </div>

                        {/* quantity controls */}
                        <div className="mt-2">
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
                      </Col>

                      <Col xs={3} className="text-end">
                        <Button
                          size="sm"
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => removeItem(it.id)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            <Row className="px-2 mt-3">
              <Col className="fw-bold">Subtotal</Col>
              <Col className="text-end fw-bold">Kes {subtotal.toFixed(2)}</Col>
            </Row>
          </Card>
        </Col>

        {/* RIGHT COLUMN: FORM */}
        <Col lg={6}>
          <Card className="p-3 checkout-form">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Street / Address</Form.Label>
                <Form.Control
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      value={address.country}
                      onChange={(e) =>
                        setAddress({ ...address, country: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button type="submit" variant="dark" disabled={submitting}>
                  {submitting ? "Processing…" : "Pay & Place Order"}
                </Button>
              </div>
            </Form>

            {message && <div className="mt-3 alert alert-info">{message}</div>}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
