import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 14,
  onChange,
  className,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        const star = (
          <Star
            size={size}
            className={filled ? "fill-warning text-warning" : "text-muted-foreground/40"}
            strokeWidth={1.8}
          />
        );
        return onChange ? (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i} stars`}
            onClick={() => onChange(i)}
            className="transition-transform hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </span>
  );
}
