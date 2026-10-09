import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { cld } from "../utils/img";

export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallbackIconSize = 18,
  loading,
  fetchPriority,
  cdnWidth,
  ...props
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span className="grid h-full w-full place-items-center bg-mist text-faint select-none">
        <Package size={fallbackIconSize} />
      </span>
    );
  }

  return (
    <img
      src={cld(src, cdnWidth)}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
