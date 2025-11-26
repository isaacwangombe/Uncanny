import React, { useCallback, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import { useCart } from "../../contexts/CartContext";
import { optimizeImage } from "../../utils/cloudinary";
import "./CardHover.css";

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
  const [addedMsg, setAddedMsg] = useState("");

  const handleAddToCart = useCallback(async () => {
    try {
      setAdding(true);
      await addItem({ product_id: product.id, quantity: 1 });
      setAddedMsg("Added to cart");
      setTimeout(() => setAddedMsg(""), 1200);
    } catch (err) {
      console.error("Add to cart failed", err);
      setAddedMsg("Failed to add");
      setTimeout(() => setAddedMsg(""), 1500);
    } finally {
      setAdding(false);
    }
  }, [addItem, product.id]);

  return (
    <div className="card hover-card">
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

          <p>
            {product.event_data && (
              <p className="text-warning fw-bold">
                {new Date(product.event_data.start).toLocaleDateString("en-KE")}{" "}
                · {product.event_data.location}
              </p>
            )}
            {product.description?.slice(0, 120)}
            {product.description?.length > 120 ? "…" : ""}
          </p>

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
              size="lg"
              className="btn-trending"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </Button>

            {addedMsg && (
              <div
                style={{
                  marginLeft: 8,
                  color: addedMsg.startsWith("Added") ? "green" : "crimson",
                }}
              >
                {addedMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CardHover);
