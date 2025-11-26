import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/Button";

import photo1 from "../../assets/HomepageImages/African.jpg";
import photo2 from "../../assets/HomepageImages/Clothes.jpg";
import photo3 from "../../assets/HomepageImages/Community.jpg";
import "./HomepageCarousel.css";

const HomepageCarousel = ({ onShopClick }) => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (selectedIndex) => setIndex(selectedIndex),
    []
  );

  // navigate helper which prefers parent's callback
  const handleShop = useCallback(
    (slug = null) => {
      if (onShopClick) return onShopClick(slug);
      if (slug) return navigate(`/store?category=${encodeURIComponent(slug)}`);
      return navigate("/store");
    },
    [navigate, onShopClick]
  );

  const handleCommunity = useCallback(
    () => navigate("/store?category=events"),
    [navigate]
  );

  return (
    <div>
      <Carousel
        className="carousel-hero"
        activeIndex={index}
        onSelect={handleSelect}
      >
        <Carousel.Item interval={10000}>
          <img
            className="d-block w-100"
            src={photo1}
            alt="Comics slide"
            loading="lazy"
          />
          <Carousel.Caption>
            <h3 className="font-large mona-sans-base">
              Explore the <span className="mona-sans-italic">hottest</span>{" "}
              comics
            </h3>
            <div className="d-flex gap-2 mb-2">
              <Button
                variant="light"
                size="lg"
                className="btn-wide"
                onClick={() => handleShop("comics")}
              >
                Shop
              </Button>
              <Button
                variant="light"
                size="lg"
                className="btn-wide"
                onClick={handleCommunity}
              >
                Community
              </Button>
            </div>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item interval={10000}>
          <img
            className="d-block w-100"
            src={photo2}
            alt="Merch slide"
            loading="lazy"
          />
          <Carousel.Caption>
            <h3 className="font-large mona-sans-base">
              Discover <span className="mona-sans-italic">awesome</span> merch
            </h3>
            <div className="d-flex gap-2 mb-2">
              <Button
                variant="light"
                size="lg"
                className="btn-wide"
                onClick={() => handleShop("merch")}
              >
                Shop
              </Button>
              <Button
                variant="light"
                size="lg"
                className="btn-wide"
                onClick={handleCommunity}
              >
                Community
              </Button>
            </div>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item interval={10000}>
          <img
            className="d-block w-100"
            src={photo3}
            alt="Community slide"
            loading="lazy"
          />
          <Carousel.Caption>
            <h3 className="font-large mona-sans-base">
              Join our <span className="mona-sans-italic">vibrant</span>{" "}
              community
            </h3>
            <div className="d-flex gap-2 mb-2">
              <Button
                variant="light"
                size="lg"
                className="btn-wide"
                onClick={() => handleShop("events")}
              >
                Shop
              </Button>
              <Button
                variant="light"
                size="lg"
                className="btn-wide"
                onClick={handleCommunity}
              >
                Community
              </Button>
            </div>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default React.memo(HomepageCarousel);
