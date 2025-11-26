import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import "./AboutPage.css";
import { apiSendMessage } from "../../api";

const AboutPage = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await apiSendMessage(form);
      setStatus("success");

      setStatus("success");
      setForm({ first_name: "", last_name: "", email: "", message: "" });
    } catch (err) {
      console.error("Message send failed:", err);
      setStatus("error");
    }
  };

  return (
    <div className="about-page">
      {/* 🌆 Hero Section */}
      <section
        className="about-hero d-flex align-items-center justify-content-center text-center text-white"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1603791452906-9e4c88e7d4a5?auto=format&fit=crop&w=1600&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "60vh",
        }}
      >
        <div className="hero-overlay"></div>
        <div className="position-relative z-2">
          <h1 className="display-4 fw-bold mb-3">
            Welcome to the Uncanny Valley
          </h1>
          <p className="lead">
            Celebrating African and Diasporic creators, stories, and art — right
            from the heart of Nairobi.
          </p>
        </div>
      </section>

      {/* 🦸 About Section */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <img
              src="https://images.unsplash.com/photo-1525186402429-b4ff38bedbec?auto=format&fit=crop&w=900&q=80"
              alt="African comics"
              className="img-fluid rounded-4 shadow-sm"
            />
          </Col>
          <Col md={6} className="mt-4 mt-md-0">
            <h2 className="fw-bold mb-3">Who We Are</h2>
            <p className="text-muted">
              At <strong>Uncanny Valley Comics</strong>, we believe the future
              of storytelling lies in diverse voices.
            </p>
            <p className="text-muted">
              We curate and sell comics, manga, games, art prints, and
              collectibles from across Africa and beyond.
            </p>
          </Col>
        </Row>
      </Container>

      {/* 💰 Sell Your Comics */}
      <section className="about-section bg-light py-5">
        <Container>
          <Row className="align-items-center flex-md-row-reverse">
            <Col md={6}>
              <img
                src="https://images.unsplash.com/photo-1573497019368-8be88a5f8a41?auto=format&fit=crop&w=900&q=80"
                alt="Sell comics"
                className="img-fluid rounded-4 shadow-sm"
              />
            </Col>
            <Col md={6} className="mt-4 mt-md-0">
              <h2 className="fw-bold mb-3">Sell Your Comics</h2>
              <p className="text-muted">
                Got comics, manga, or collectibles gathering dust? We buy
                personal collections and works from creators.
              </p>
              <p className="text-muted">
                Email us at{" "}
                <a href="mailto:uvcomicbooks@gmail.com">
                  uvcomicbooks@gmail.com
                </a>
                .
              </p>
              <p className="text-muted small">
                P.S. We also buy games, art prints, and original books.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ✍️ Publish With Us */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2 className="fw-bold mb-3">Publish With Us</h2>
            <p className="text-muted">
              Are you an aspiring comic author or illustrator? We offer guidance
              and creative consultation.
            </p>
            <p className="text-muted">
              Reach out at{" "}
              <a href="mailto:uvcomicbooks@gmail.com">uvcomicbooks@gmail.com</a>
              .
            </p>
          </Col>
          <Col md={6}>
            <img
              src="https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=900&q=80"
              alt="Publishing help"
              className="img-fluid rounded-4 shadow-sm"
            />
          </Col>
        </Row>
      </Container>

      {/* 📬 Contact Form */}
      <section className="about-contact bg-dark text-white py-5">
        <Container style={{ maxWidth: "720px" }}>
          <h2 className="fw-bold text-center mb-4">Get In Touch</h2>
          <p className="text-center text-muted mb-5">
            Have a question or collaboration idea? Send us a message below.
          </p>

          {/* Alerts */}
          {status === "success" && (
            <Alert variant="success" className="text-center">
              🎉 Message sent! We’ll get back to you soon.
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="danger" className="text-center">
              ❌ Something went wrong. Please try again.
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Your first name"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Your last name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Tell us how we can help…"
              />
            </Form.Group>

            <div className="text-center">
              <Button
                variant="light"
                size="lg"
                className="px-5"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </Form>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;
