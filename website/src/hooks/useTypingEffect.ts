"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Options {
  minDelay?: number;
  maxDelay?: number;
  /** Probability (0–1) of fumbling an eligible letter before typing it correctly. */
  typoChance?: number;
  /** Minimum correctly-typed letters between two fumbles, so mistakes stay spread out. */
  typoGap?: number;
}

interface Result {
  displayed: string;
  done: boolean;
}

type Op =
  | { kind: "type"; ch: string; delay: number }
  | { kind: "delete"; delay: number };

// QWERTY neighbours — the kind of key you'd actually fat-finger instead of the right one.
const NEIGHBORS: Record<string, string> = {
  a: "s",
  b: "v",
  c: "x",
  d: "f",
  e: "r",
  f: "g",
  g: "h",
  h: "j",
  i: "o",
  j: "k",
  k: "l",
  l: "k",
  m: "n",
  n: "m",
  o: "p",
  p: "o",
  q: "w",
  r: "t",
  s: "d",
  t: "y",
  u: "i",
  v: "b",
  w: "e",
  x: "z",
  y: "u",
  z: "x"
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function neighborOf(ch: string): string {
  const lower = ch.toLowerCase();
  const hit = NEIGHBORS[lower];
  if (!hit) return ch;
  // Preserve the casing of the intended character.
  return ch === lower ? hit : hit.toUpperCase();
}

/**
 * Flatten the target text into a stream of keystroke ops. Most letters are a
 * single "type" op, but every so often we slip a believable mistake in first:
 * tap a neighbouring key (sometimes two), pause as if noticing, backspace it,
 * then carry on with the correct character.
 */
function buildOps(
  text: string,
  minDelay: number,
  maxDelay: number,
  typoChance: number,
  typoGap: number
): Op[] {
  const ops: Op[] = [];
  let sinceLastTypo = typoGap; // allow a fumble early, but not on the very first char

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const isLetter = /[a-z]/i.test(ch);
    const canFumble =
      isLetter && i > 0 && sinceLastTypo >= typoGap && Math.random() < typoChance;

    if (canFumble) {
      // First wrong key — usually a neighbour, so it reads as a real slip.
      const wrong1 = neighborOf(ch);
      ops.push({ kind: "type", ch: wrong1, delay: rand(minDelay, maxDelay) });

      // Sometimes the fingers run ahead and a second wrong letter sneaks in.
      const doubleSlip = Math.random() < 0.4 && i + 1 < text.length;
      let wrongCount = 1;
      if (doubleSlip) {
        const next = text[i + 1];
        const wrong2 = /[a-z]/i.test(next) ? neighborOf(next) : wrong1;
        ops.push({ kind: "type", ch: wrong2, delay: rand(minDelay, maxDelay) });
        wrongCount = 2;
      }

      // The "wait, that's wrong" beat before backspacing.
      ops.push({ kind: "delete", delay: rand(260, 480) });
      for (let d = 1; d < wrongCount; d += 1) {
        ops.push({ kind: "delete", delay: rand(55, 110) });
      }

      // A small settling pause, then the real character.
      ops.push({ kind: "type", ch, delay: rand(120, 220) });
      sinceLastTypo = 0;
      continue;
    }

    ops.push({ kind: "type", ch, delay: rand(minDelay, maxDelay) });
    if (isLetter) sinceLastTypo += 1;
  }

  return ops;
}

export function useTypingEffect(
  text: string,
  {
    minDelay = 40,
    maxDelay = 120,
    typoChance = 0.1,
    typoGap = 18
  }: Options = {}
): Result {
  const reduce = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduce === true ? text : "");
  const [done, setDone] = useState(reduce === true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    const ops = buildOps(text, minDelay, maxDelay, typoChance, typoGap);
    let buffer = "";
    let opIndex = 0;

    setDisplayed("");
    setDone(false);

    function step() {
      if (opIndex >= ops.length) {
        setDone(true);
        return;
      }
      const op = ops[opIndex];
      opIndex += 1;
      if (op.kind === "type") {
        buffer += op.ch;
      } else {
        buffer = buffer.slice(0, -1);
      }
      setDisplayed(buffer);
      timerRef.current = setTimeout(step, op.delay);
    }

    timerRef.current = setTimeout(step, minDelay);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [text, minDelay, maxDelay, typoChance, typoGap, reduce]);

  return { displayed, done };
}
