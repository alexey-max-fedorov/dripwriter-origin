"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function AnimatedText({
  children,
  className,
  delay = 0,
  as: Tag = "span"
}: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = children.split(" ");

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className} aria-label={children}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.08,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="inline-block mr-[0.25em] last:mr-0"
          aria-hidden="true"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
