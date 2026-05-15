import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  external?: boolean;
  "aria-label"?: string;
}

const variants = {
  primary:
    "bg-[#c9a84c] text-black font-semibold hover:bg-[#d4b65e] hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] active:scale-[0.98]",
  outline:
    "border border-[#c9a84c] text-[#c9a84c] hover:bg-[rgba(201,168,76,0.08)] hover:shadow-[0_0_16px_rgba(201,168,76,0.2)] active:scale-[0.98]",
  ghost:
    "text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a] active:scale-[0.98]"
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-md",
  md: "px-6 py-3 text-sm rounded-md",
  lg: "px-8 py-4 text-base rounded-md"
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className,
  type = "button",
  disabled,
  external,
  "aria-label": ariaLabel
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 cursor-pointer select-none",
    variants[variant],
    sizes[size],
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
