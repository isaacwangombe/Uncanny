import React, { useState } from "react";
import "./Footer.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import logo from "../../assets/UVC.png";
import { FaInstagram, FaWhatsapp, FaTiktok, FaFacebookF } from "react-icons/fa";
import { subscribeToMailingList } from "../../api"; // correct import

const Footer = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const menuItems = ["HOME", "ABOUT", "CONTACT", "TERMS OF USE"];

  const socialLinks = [
    { icon: <FaInstagram />, url: "https://www.instagram.com" },
    { icon: <FaWhatsapp />, url: "https://wa.me/254700000000" },
    { icon: <FaTiktok />, url: "https://www.tiktok.com/@yourusername" },
    { icon: <FaFacebookF />, url: "https://www.facebook.com/yourpage" },
  ];

  const handleSubscribe = async () => {
    if (!email.includes("@")) {
      setStatus("Please enter a valid email.");
      return;
    }
    if (!name.trim()) {
      setStatus("Please enter your name.");
      return;
    }

    setStatus("Sending...");

    try {
      // split name into first/last
      const [first_name, ...rest] = name.trim().split(" ");
      const last_name = rest.join(" ") || "";

      await subscribeToMailingList({ email, first_name, last_name });

      setStatus("Subscribed! 🎉");
      setEmail("");
      setName("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to subscribe. Try again.");
    }

    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="bg-black text-white text-center footer-height py-4">
      <Container>
        {/* Social Icons */}
        <div className="d-flex justify-content-center mb-3 gap-4 fs-3">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover-glow"
              style={{ transition: "0.3s" }}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Logo */}
        <div className="mb-3">
          <img
            src={logo}
            width="90"
            height="60"
            className="d-inline-block align-top"
            alt="Uncanny Valley Comics"
          />
          <span className="mona-sans-base fs-1 ms-2">
            Uncanny Valley Comics
          </span>
        </div>

        {/* Menu */}
        <Row className="justify-content-center p-3">
          {menuItems.map((item, index) => (
            <Col xs="auto" key={index} className="text-uppercase mx-3">
              {item}
            </Col>
          ))}
        </Row>

        {/* Mailing List */}
        <div className="mt-4">
          <h5 className="mb-2">Join our mailing list</h5>

          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Your name"
              style={{ maxWidth: 250 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              className="form-control"
              placeholder="Your email"
              style={{ maxWidth: 250 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="btn btn-primary" onClick={handleSubscribe}>
              Subscribe
            </button>
          </div>

          {status && (
            <div className="mt-2 small" style={{ opacity: 0.9 }}>
              {status}
            </div>
          )}
        </div>

        <div className="mt-4 small text-secondary">© 2025 UNCANNY VALLEY</div>
      </Container>
    </div>
  );
};

export default Footer;
