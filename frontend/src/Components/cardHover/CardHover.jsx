import React, { useCallback, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import { useCart } from "../../contexts/CartContext";
import { optimizeImage } from "../../utils/cloudinary";
import "./CardHover.css";
import { Link } from "react-router-dom";

const formatKES = (v) => {
  if (v === null || v === undefined) return "KES 0.00";
  const n = Number(v || 0);
  return `KES ${n.toFixed(2)}`;
};

const CardHover = ({ product }) => {
  const { addItem } = useCart();

  const rawUrl = product?.images?.[0]?.image || null;
  const imageUrl = useMemo(
    () =>
      rawUrl
        ? optimizeImage(rawUrl, 300)
        : "https://via.placeholder.com/400?text=No+Image",
    [rawUrl]
  );

  const effectivePrice = useMemo(
    () => product?.discounted_price ?? product?.price ?? 0,
    [product?.discounted_price, product?.price]
  );
  const hasDiscount = product?.discounted_price != null;

  const [adding, setAdding] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const handleAddToCart = useCallback(async () => {
    try {
      setAdding(true);
      await addItem({ product, quantity: 1 });

      // show floating notification
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 1200);
    } catch (err) {
      console.error("Add to cart failed", err);

      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 1500);
    } finally {
      setAdding(false);
    }
  }, [addItem, product]);

  return (
    <div className="card hover-card" style={{ position: "relative" }}>
      <div className="image">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="details">
        <div className="center">
          <h1>{product.title}</h1>

          <div>
            {product.event_data && (
              <div className="text-warning fw-bold">
                {new Date(product.event_data.start).toLocaleDateString("en-KE")}{" "}
                · {product.event_data.location}
              </div>
            )}
            <p className="clamp-4">{product.description}</p>
          </div>

          <p>
            {hasDiscount ? (
              <>
                <span
                  style={{
                    textDecoration: "line-through",
                    opacity: 0.7,
                    marginRight: 8,
                  }}
                >
                  {formatKES(product.price)}
                </span>
                <span style={{ fontWeight: 700 }}>
                  {formatKES(effectivePrice)}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 700 }}>
                {formatKES(effectivePrice)}
              </span>
            )}
          </p>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button
              variant="dark"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </Button>

            <Button
              as={Link}
              to={`/product/${product.id}`}
              variant="outline-dark"
              className="flex-1"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CardHover);
