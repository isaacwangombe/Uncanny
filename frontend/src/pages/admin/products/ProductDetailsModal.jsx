import React, { useState } from "react";
import { Modal, Row, Col, Badge, Button } from "react-bootstrap";
import "../../../styles/admin-theme.css";

const ProductDetailsModal = ({
  show,
  onHide,
  product,
  categories,
  backendUrl,
}) => {
  const [expandedImage, setExpandedImage] = useState(null);

  if (!product) return null;

  const sub = categories.find((c) => c.id === product.category);
  const main = sub ? categories.find((c) => c.id === sub.parent) : null;

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img.image === "string") {
      if (img.image.startsWith("http")) return img.image;
      return backendUrl + img.image;
    } else if (img.image?.url) return img.image.url;
    return null;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4 className="fw-semibold mb-3">{product.title}</h4>
          <p className="text-muted mb-4">
            {product.description || "No description provided."}
          </p>

          <Row>
            <Col md={6}>
              <p>
                <strong>Main Category:</strong> {main?.name || "—"}
              </p>
              <p>
                <strong>Subcategory:</strong> {sub?.name || "—"}
              </p>
              <p>
                <strong>Cost:</strong>{" "}
                {product.cost !== null && product.cost !== undefined
                  ? Number(product.cost).toFixed(2)
                  : "—"}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Price:</strong>{" "}
                {product.price !== null && product.price !== undefined
                  ? Number(product.price).toFixed(2)
                  : "—"}
              </p>
              <p>
                <strong>Discounted Price:</strong>{" "}
                {product.discounted_price !== null &&
                product.discounted_price !== undefined
                  ? Number(product.discounted_price).toFixed(2)
                  : "—"}
              </p>
              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {product.is_active ? (
                  <Badge bg="success">Active</Badge>
                ) : (
                  <Badge bg="secondary">Inactive</Badge>
                )}
              </p>
            </Col>
          </Row>

          <hr />
          <h6>Images</h6>

          {product.images?.length ? (
            <Row className="g-3">
              {product.images.map((img) => {
                const imageUrl = getImageUrl(img);
                return (
                  <Col key={img.id} md={3} sm={4} xs={6}>
                    <div
                      style={{
                        width: "100%",
                        height: "120px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "#f8f9fa",
                      }}
                      onClick={() => imageUrl && setExpandedImage(imageUrl)}
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={img.alt || "Product image"}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p className="text-muted">No images uploaded.</p>
          )}
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

export default ProductDetailsModal;
