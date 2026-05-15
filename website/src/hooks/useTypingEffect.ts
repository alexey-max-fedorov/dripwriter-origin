"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Options {
  minDelay?: number;
  maxDelay?: number;
}

interface Result {
  displayed: string;
  done: boolean;
}

export function useTypingEffect(
  text: string,
  { minDelay = 40, maxDelay = 120 }: Options = {}
): Result {
  const reduce = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduce ? text : "");
  const [done, setDone] = useState(reduce ?? false);
  const indexRef = useRef(reduce ? text.length : 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    function typeNext() {
      if (indexRef.current >= text.length) {
        setDone(true);
        return;
      }
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      timerRef.current = setTimeout(typeNext, delay);
    }

    timerRef.current = setTimeout(typeNext, minDelay);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [text, minDelay, maxDelay, reduce]);

  return { displayed, done };
}
