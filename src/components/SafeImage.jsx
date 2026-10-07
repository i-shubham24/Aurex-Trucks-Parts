import { useState, useEffect } from "react";
import { Package } from "lucide-react";

export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallbackIconSize = 18,
  loading,
  fetchPriority,
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
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
