import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Badge } from "react-bootstrap";
import { fetchProducts, fetchProductById, apiAddCartItem } from "../../api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { optimizeImage } from "../../utils/cloudinary";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // resolve image and optimize
  const resolveUrl = useCallback((img, w = 800) => {
    if (!img) return null;
    const url = typeof img === "string" ? img : img.image || img.image?.url;
    if (!url) return null;
    return optimizeImage(url, w);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prod, all] = await Promise.all([
        fetchProductById(id),
        fetchProducts({ page: 1 }),
      ]);

      const clean = {
        ...prod,
        price: parseFloat(prod.price) || 0,
        discounted_price: parseFloat(prod.discounted_price) || 0,
      };

      setProduct(clean);

      if (prod.images?.length) {
        setMainImage(resolveUrl(prod.images[0], 1000));
      } else {
        setMainImage(null);
      }

      generateRecommendations(clean, all.results || all);
    } catch (err) {
      console.error("❌ Failed to load product details:", err);
      setProduct(null);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      await apiAddCartItem(product.id, quantity);
      // quick feedback
      alert("✅ Added to cart!");
      setQuantity(1);
    } catch (err) {
      console.error("❌ Failed to add to cart:", err);
      alert("Failed to add to cart");
    }
  }, [product, quantity]);

  const generateRecommendations = useCallback((current, all = []) => {
    if (!current || !Array.isArray(all)) {
      setRecommended([]);
      return;
    }

    // 1) same subcategory
    let recs = all.filter(
      (p) => p.id !== current.id && p.category === current.category
    );

    // 2) same parent
    if (recs.length < 3 && current.category_obj?.parent) {
      recs = recs.concat(
        all.filter(
          (p) =>
            p.id !== current.id &&
            p.category_obj?.parent === current.category_obj?.parent
        )
      );
    }

    // 3) similar title
    if (recs.length < 3) {
      const word = (current.title || "").split(" ")[0]?.toLowerCase();
      if (word) {
        recs = recs.concat(
          all.filter(
            (p) =>
              p.id !== current.id &&
              (p.title || "").toLowerCase().includes(word)
          )
        );
      }
    }

    const unique = Array.from(new Map(recs.map((p) => [p.id, p])).values());
    setRecommended(unique.slice(0, 3));
  }, []);

  const effective = useMemo(
    () =>
      product
        ? product.discounted_price > 0
          ? product.discounted_price
          : product.price
        : 0,
    [product]
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-5 text-muted">Product not found.</div>
    );
  }

  return (
    <Container className="py-5">
      <Button
        variant="link"
        onClick={() => navigate(-1)}
        className="mb-3 text-decoration-none"
      >
        ← Back
      </Button>

      <Row className="align-items-start">
        {/* LEFT COLUMN: IMAGE + THUMBNAILS */}
        <Col md={6}>
          <div
            className="mb-3 text-center border rounded p-2"
            style={{ background: "#fafafa" }}
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: "400px", background: "#eee" }}
              >
                No Image
              </div>
            )}
          </div>

          {/* THUMBNAILS */}
          {product.images?.length > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  const idx = product.images.findIndex(
                    (img) => resolveUrl(img, 1000) === mainImage
                  );
                  const prev =
                    (idx - 1 + product.images.length) % product.images.length;
                  setMainImage(resolveUrl(product.images[prev], 1000));
                }}
              >
                <ChevronLeft size={16} />
              </Button>

              <div
                className="d-flex overflow-auto px-2"
                style={{ gap: "8px", maxWidth: "85%" }}
              >
                {product.images.map((img, i) => {
                  const thumb = resolveUrl(img, 200);
                  const full = resolveUrl(img, 1000);
                  return (
                    <div
                      key={i}
                      onClick={() => setMainImage(full)}
                      style={{
                        border:
                          full === mainImage
                            ? "2px solid #007bff"
                            : "1px solid #ccc",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={thumb}
                        alt={`thumb-${i}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  );
                })}
              </div>

              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  const idx = product.images.findIndex(
                    (img) => resolveUrl(img, 1000) === mainImage
                  );
                  const next = (idx + 1) % product.images.length;
                  setMainImage(resolveUrl(product.images[next], 1000));
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </Col>

        {/* RIGHT COLUMN: DETAILS */}
        <Col md={6}>
          <h3 className="fw-bold">{product.title}</h3>
          {/* EVENT DETAILS */}
          {product.event_data && (
            <div className="mb-3 p-3 border rounded bg-light">
              <h5 className="fw-bold text-danger mb-2">Event Information</h5>
              <p className="m-0">
                <strong>Date:</strong>{" "}
                {new Date(product.event_data.start).toLocaleDateString("en-KE")}
              </p>
              <p className="m-0">
                <strong>Time:</strong>{" "}
                {new Date(product.event_data.start).toLocaleTimeString(
                  "en-KE",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
                {" – "}
                {new Date(product.event_data.end).toLocaleTimeString("en-KE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="m-0">
                <strong>Location:</strong> {product.event_data.location}
              </p>
            </div>
          )}

          <h4 className="mb-2">KES {Number(effective || 0).toFixed(2)}</h4>

          <Badge
            bg={product.stock > 0 ? "success" : "secondary"}
            className="mb-2"
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </Badge>

          <p className="mt-3">{product.description}</p>

          {/* QUANTITY + ADD TO CART */}
          <div className="d-flex align-items-center mb-4 mt-4">
            <Button
              variant="light"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </Button>

            <div
              className="px-3 py-1 border mx-2 rounded"
              style={{ minWidth: "50px", textAlign: "center" }}
            >
              {quantity}
            </div>

            <Button variant="light" onClick={() => setQuantity((q) => q + 1)}>
              +
            </Button>

            <Button
              className="ms-3"
              variant="primary"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </Button>
          </div>

          <p>
            <strong>Category:</strong>{" "}
            {product.category_obj?.parent_name || "—"}
          </p>
          <p>
            <strong>Subcategory:</strong> {product.category_obj?.name || "—"}
          </p>
        </Col>
      </Row>

      {/* Recommended Items */}
      <hr className="my-5" />
      <h5 className="mb-4">Recommended for You</h5>
      <Row>
        {recommended.length ? (
          recommended.map((rec) => {
            const imgUrl = resolveUrl(rec.images?.[0], 300);
            const recEffective =
              Number(
                rec.discounted_price > 0 ? rec.discounted_price : rec.price
              ) || 0;
            return (
              <Col key={rec.id} md={4} sm={6} xs={12} className="mb-4">
                <div
                  className="card h-100 shadow-sm"
                  style={{ cursor: "pointer", transition: "0.2s" }}
                  onClick={() => navigate(`/product/${rec.id}`)}
                >
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      className="card-img-top"
                      style={{ height: "220px", objectFit: "cover" }}
                      alt={rec.title}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="card-body">
                    <h6 className="card-title">{rec.title}</h6>
                    <p className="mb-1 text-muted">
                      KES {recEffective.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Col>
            );
          })
        ) : (
          <p className="text-muted">No recommendations available.</p>
        )}
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
