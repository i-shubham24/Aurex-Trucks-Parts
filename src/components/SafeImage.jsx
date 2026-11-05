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
      alt={safeAlt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
