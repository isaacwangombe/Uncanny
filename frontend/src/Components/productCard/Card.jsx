import React from "react";
import "./productCard.css";
import { useCart } from "../../contexts/CartContext";

const ProductCard = () => {
  return (
    <div>
      <a href="#" className="card">
        <img
          src="https://cdn.shopify.com/s/files/1/0743/0032/6179/files/22B77C0F-7215-492D-9DAF-2F2AB22323E9.jpg?v=1757157725"
          className="card__image"
          alt=""
        />
        <div className="card__overlay">
          <div className="card__header">
            <svg className="card__arc" xmlns="http://www.w3.org/2000/svg">
              <path />
            </svg>

            <div className="card__header-text">
              <h3 className="card__title">Jessica Parker</h3>
              <span className="card__status">1 hour ago</span>
            </div>
          </div>
          <p className="card__description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores,
            blanditiis?
          </p>
        </div>
      </a>
    </div>
  );
};

export default ProductCard;
