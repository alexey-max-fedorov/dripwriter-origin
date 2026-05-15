import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2" | "h3";
  eyebrow?: string;
  id?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  titleClassName,
  as: Tag = "h2",
  eyebrow,
  id
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.25em] uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          "font-playfair text-white leading-tight",
          Tag === "h1" && "text-4xl md:text-5xl lg:text-6xl font-bold",
          Tag === "h2" && "text-3xl md:text-4xl lg:text-5xl font-semibold",
          Tag === "h3" && "text-2xl md:text-3xl font-medium",
          titleClassName
        )}
        style={{ fontFamily: "var(--font-playfair-display), Georgia, serif" }}
      >
        {title}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-[#a0a0a0] leading-relaxed",
            Tag === "h1" ? "text-lg md:text-xl max-w-2xl" : "text-base md:text-lg max-w-2xl",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
