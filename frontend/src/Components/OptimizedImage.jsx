import { optimizeImage } from "../utils/cloudinary";

const OptimizedImage = ({
  src,
  width = 600,
  alt = "",
  className = "",
  style = {},
}) => {
  if (!src) {
    return (
      <img
        src="https://via.placeholder.com/600?text=No+Image"
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
      />
    );
  }

  const optimized = optimizeImage(src, width);

  return (
    <picture>
      {/* Modern WebP format */}
      <source srcSet={optimized.replace("/upload/", "/upload/f_webp/")} />

      {/* Fallback optimized image */}
      <img
        src={optimized}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
      />
    </picture>
  );
};

export default OptimizedImage;
