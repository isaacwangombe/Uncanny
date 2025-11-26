import React, { useCallback, useMemo } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { optimizeImage } from "../../utils/cloudinary";
import "./productCard.css";

const formatKES = (v) => {
  if (v === null || v === undefined) return "KES 0.00";
  const n = Number(v || 0);
  return `KES ${n.toFixed(2)}`;
};

const formatEventDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const isEvent = !!product.event_data;

  const rawUrl = product?.images?.length ? product.images[0].image : null;
  const imageUrl = useMemo(() => {
    if (!rawUrl) {
      return "https://cdn.shopify.com/s/files/1/0743/0032/6179/files/22B77C0F-7215-492D-9DAF-2F2AB22323E9.jpg?v=1757157725";
    }
    return optimizeImage(rawUrl, 350);
  }, [rawUrl]);

  const effectivePrice = useMemo(
    () => product?.discounted_price ?? product?.price ?? 0,
    [product?.discounted_price, product?.price]
  );
  const hasDiscount = product?.discounted_price != null;

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await addItem({ product, quantity: 1 });
      } catch (err) {
        console.error("Add to cart failed", err);
      }
    },
    [addItem, product]
  );

  return (
    <div className="card_container" aria-hidden={false}>
      <a
        href="#"
        className="card product_card"
        onClick={(e) => e.preventDefault()}
        aria-label={`Product ${product.title}`}
      >
        <img
          src={imageUrl}
          className="card__image"
          alt={product.title}
          loading="lazy"
        />

        <div className="card__overlay">
          <div className="card__header">
            <svg className="card__arc" xmlns="http://www.w3.org/2000/svg">
              <path />
            </svg>

            <div className="card__header-text">
              <h3 className="card__title">{product.title}</h3>

              {isEvent ? (
                <span className="card__status fw-bold text-warning">
                  {formatEventDate(product.event_data.start)} ·{" "}
                  {product.event_data.location}
                </span>
              ) : hasDiscount ? (
                <span className="card__status">
                  <span className="line-through me-2 opacity-75">
                    {formatKES(product.price)}
                  </span>
                  <span className="fw-bold">{formatKES(effectivePrice)}</span>
                </span>
              ) : (
                <span className="card__status fw-bold">
                  {formatKES(effectivePrice)}
                </span>
              )}
            </div>
          </div>

          <div className="card__description">
            <p className="line-clamp">{product.description}</p>

            <div className="d-flex align-items-center gap-2">
              <Button variant="dark" size="sm" onClick={handleAdd}>
                Add to cart
              </Button>

              <Link
                to={`/product/${product.id}`}
                className="text-dark text-decoration-none ms-2"
              >
                <small className="mb-0">Details →</small>
              </Link>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default React.memo(ProductCard);
