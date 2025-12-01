import React, { useMemo } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CardHover from "../cardHover/CardHover";
import "./MultiCarousel.css";

const MultiCarousel = ({ products = [] }) => {
  const responsive = useMemo(
    () => ({
      desktop: {
        breakpoint: { max: 3000, min: 1280 },
        items: 4,
        partialVisibilityGutter: 40,
      },
      laptop: {
        breakpoint: { max: 1280, min: 1024 },
        items: 3,
        partialVisibilityGutter: 40,
      },
      tablet: {
        breakpoint: { max: 1024, min: 600 },
        items: 1.5,
        partialVisibilityGutter: 60,
      },
      mobile: {
        breakpoint: { max: 600, min: 0 },
        items: 1.2,
        partialVisibilityGutter: 50,
      },
    }),
    []
  );

  return (
    <div>
      <Carousel
        responsive={responsive}
        infinite={true}
        arrows={true}
        swipeable={true}
        draggable={true}
        partialVisible={true}
        autoPlaySpeed={2500}
        keyBoardControl={true}
        customTransition="all 0.5s ease"
        transitionDuration={500}
        containerClass="carousel-container"
        itemClass="carousel-item-padding"
      >
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="carousel-item-wrapper">
              <CardHover product={product} />
            </div>
          ))
        ) : (
          <div style={{ padding: 24 }}>No trending products found.</div>
        )}
      </Carousel>
    </div>
  );
};

export default React.memo(MultiCarousel);
