import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { cld } from "../utils/img";

export default function SafeImage({
  src,
  alt,
  className = "",
  fallbackIconSize = 18,
  loading,
  fetchPriority,
  cdnWidth,
  ...props
}) {
  const safeAlt = (alt && alt.trim()) || "Aurex commercial truck and trailer parts";
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  if (!imgSrc || failed) {
    return (
      <span className="grid h-full w-full place-items-center bg-mist text-faint select-none">
        <Package size={fallbackIconSize} />
      </span>
    );
  }

  const defaultDimension = cdnWidth || 360;

  return (
    <img
      src={cld(imgSrc, cdnWidth)}
      alt={safeAlt}
      width={props.width || defaultDimension}
      height={props.height || defaultDimension}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => {
        if (typeof imgSrc === "string" && imgSrc.endsWith(".webp")) {
          setImgSrc(imgSrc.replace(/\.webp$/, ".jpg"));
        } else {
          setFailed(true);
        }
      }}
      className={className}
      {...props}
    />
  );
}
