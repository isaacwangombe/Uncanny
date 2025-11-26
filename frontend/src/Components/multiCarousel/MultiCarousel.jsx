import React, { useMemo } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CardHover from "../cardHover/CardHover";
import "./MultiCarousel.css";

const MultiCarousel = ({ products = [] }) => {
  const responsive = useMemo(
    () => ({
      desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
      tablet: { breakpoint: { max: 1024, min: 600 }, items: 2 },
      mobile: { breakpoint: { max: 599, min: 0 }, items: 1 },
    }),
    []
  );

  return (
    <div className="px-5">
      <Carousel
        responsive={responsive}
        infinite={products.length > (responsive.desktop.items || 3)}
        autoPlaySpeed={2500}
        keyBoardControl={true}
        customTransition="all 0.5s ease"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["mobile"]}
        itemClass="px-3"
      >
        {products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="carousel-items">
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
