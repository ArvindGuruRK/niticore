"use client";

/**
 * TextType, from React Bits (https://reactbits.dev), JavaScript + CSS variant. Same props and
 * markup as upstream. Changes:
 * - TypeScript types, and the two CSS rules moved to Tailwind classes.
 * - Timing engine: upstream types with a setTimeout and a React state update per character, which
 *   drifts against the screen refresh and re-renders on every character (choppy at fast speeds).
 *   Here a GSAP ticker advances the text by elapsed time and writes straight to the DOM, so the
 *   rate stays even at any speed and React never re-renders while typing.
 * - Reduced motion shows the first text static. Screen readers get the first text as plain content.
 * - Added props: stableLayout (fixed line breaks while typing), prefix (a fixed stem), typePrefix
 *   (type the stem once on load, then keep it fixed) and exit ("fade" instead of deleting).
 */
import { useEffect, useMemo, useRef, useSyncExternalStore, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

export type TextTypeProps = {
  /** Text or array of texts to type out */
  text: string | string[];
  as?: ElementType;
  /** Milliseconds per typed character */
  typingSpeed?: number;
  /** Milliseconds before typing starts */
  initialDelay?: number;
  /** Milliseconds to wait between typing and deleting */
  pauseDuration?: number;
  /** Milliseconds per deleted character */
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: ReactNode;
  cursorClassName?: string;
  /** Seconds per cursor blink */
  cursorBlinkDuration?: number;
  /** One colour per sentence */
  textColors?: string[];
  /** Random typing speed within a range, for a human feel */
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  /** Start typing when the component enters the viewport */
  startOnVisible?: boolean;
  /** Type right to left */
  reverseMode?: boolean;
  /** Render the not-yet-typed remainder as invisible text, so the final line breaks and centring are fixed from the first character and nothing reflows while typing. */
  stableLayout?: boolean;
  /** Fixed text that stays at the start of the line while the typed text continues after it. */
  prefix?: string;
  /** Type the prefix once on load, with the cursor running through it, then keep it fixed while the texts rotate after it */
  typePrefix?: boolean;
  /** How a finished text leaves: "delete" removes it character by character (upstream), "fade" fades the whole text out. Use "fade" for long, multi-line text. */
  exit?: "delete" | "fade";
} & Record<string, unknown>;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  );

type Phase = "delay" | "prefix" | "typing" | "hold" | "fading" | "deleting";

export default function TextType({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  stableLayout = false,
  prefix = "",
  typePrefix = false,
  exit = "delete",
  ...props
}: TextTypeProps) {
  const prefixTypedRef = useRef<HTMLSpanElement>(null);
  const prefixRestRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onSentenceComplete);
  const reduced = usePrefersReducedMotion();

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const textKey = textArray.join("\u0000");
  const colorKey = textColors.join("|");
  const speedKey = variableSpeed ? `${variableSpeed.min}-${variableSpeed.max}` : "";

  useEffect(() => {
    onCompleteRef.current = onSentenceComplete;
  }, [onSentenceComplete]);

  // Cursor blink
  useEffect(() => {
    if (reduced || !showCursor || !cursorRef.current) return;
    const cursor = cursorRef.current;
    gsap.set(cursor, { opacity: 1 });
    const tween = gsap.to(cursor, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => {
      tween.kill();
    };
  }, [showCursor, cursorBlinkDuration, reduced]);

  // Typing engine: one ticker callback, time-based, writes to the DOM directly
  useEffect(() => {
    const typedEl = typedRef.current;
    if (reduced || !typedEl) return;
    const restEl = restRef.current;
    const cursorEl = cursorRef.current;
    const prefixTypedEl = prefixTypedRef.current;
    const prefixRestEl = prefixRestRef.current;
    const doPrefix = typePrefix && prefix.length > 0 && !!prefixTypedEl;

    let pc = 0; // characters of the prefix typed so far
    let index = 0;
    let count = 0;
    let phase: Phase = "delay";
    let wait = initialDelay;
    let stepLeft = 0;
    let active = !startOnVisible;

    const current = () => (reverseMode ? [...textArray[index]].reverse().join("") : textArray[index]);
    const step = (base: number) =>
      Math.max(
        variableSpeed ? Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min : base,
        1,
      );
    const paint = () => {
      const t = current();
      typedEl.textContent = t.slice(0, count);
      if (restEl) restEl.textContent = t.slice(count);
      typedEl.style.color = textColors.length ? textColors[index % textColors.length] : "";
      if (cursorEl && hideCursorWhileTyping) {
        cursorEl.style.display = phase === "typing" || phase === "deleting" ? "none" : "";
      }
    };
    const paintPrefix = () => {
      if (!prefixTypedEl) return;
      prefixTypedEl.textContent = prefix.slice(0, pc);
      if (prefixRestEl) prefixRestEl.textContent = prefix.slice(pc);
    };
    paint();
    if (doPrefix) {
      paintPrefix();
      prefixTypedEl!.after(cursorEl ?? "");
    }

    const tick = (_time: number, deltaMs: number) => {
      if (!active) return;
      let dt = Math.min(deltaMs, 100); // a background tab must not fast-forward the text
      for (;;) {
        if (phase === "fading") return; // the fade tween hands control back when it ends
        if (phase === "delay" || phase === "hold") {
          if (dt < wait) {
            wait -= dt;
            return;
          }
          dt -= wait;
          wait = 0;
          if (phase === "hold" && exit === "fade") {
            phase = "fading";
            gsap.to(typedEl, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                onCompleteRef.current?.(textArray[index], index);
                index = (index + 1) % textArray.length;
                count = 0;
                paint();
                gsap.set(typedEl, { opacity: 1 });
                phase = "delay";
                wait = 350;
              },
            });
            return;
          }
          phase = phase === "delay" ? (doPrefix && pc < prefix.length ? "prefix" : "typing") : "deleting";
          stepLeft = step(phase === "deleting" ? deletingSpeed : typingSpeed);
          paint();
        } else if (phase === "prefix") {
          if (dt < stepLeft) {
            stepLeft -= dt;
            return;
          }
          dt -= stepLeft;
          pc += 1;
          paintPrefix();
          if (pc >= prefix.length) {
            // The prefix is done and stays fixed from here on. The cursor moves on to the first text.
            typedEl.after(cursorEl ?? "");
            phase = "typing";
          }
          stepLeft = step(typingSpeed);
        } else if (phase === "typing") {
          if (dt < stepLeft) {
            stepLeft -= dt;
            return;
          }
          dt -= stepLeft;
          count += 1;
          if (count >= current().length) {
            count = current().length;
            paint();
            if (!loop && index === textArray.length - 1) {
              onCompleteRef.current?.(textArray[index], index);
              gsap.ticker.remove(tick);
              return;
            }
            phase = "hold";
            wait = pauseDuration;
          } else {
            stepLeft = step(typingSpeed);
            paint();
          }
        } else {
          if (dt < stepLeft) {
            stepLeft -= dt;
            return;
          }
          dt -= stepLeft;
          count -= 1;
          if (count <= 0) {
            count = 0;
            onCompleteRef.current?.(textArray[index], index);
            index = (index + 1) % textArray.length;
            phase = "delay";
            wait = 300;
          } else {
            stepLeft = step(deletingSpeed);
          }
          paint();
        }
      }
    };

    gsap.ticker.add(tick);

    let observer: IntersectionObserver | undefined;
    if (startOnVisible && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            active = true;
            observer?.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(containerRef.current);
    }

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(typedEl);
      gsap.set(typedEl, { opacity: 1 });
      if (cursorEl) typedEl.after(cursorEl); // put the cursor back where React rendered it
      observer?.disconnect();
    };
    // textKey, colorKey and speedKey stand in for the array and object props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    textKey,
    colorKey,
    speedKey,
    typingSpeed,
    initialDelay,
    pauseDuration,
    deletingSpeed,
    loop,
    hideCursorWhileTyping,
    startOnVisible,
    reverseMode,
    reduced,
    exit,
    typePrefix,
    prefix,
  ]);

  const Tag: ElementType = Component;

  return (
    <Tag ref={containerRef} className={cn("inline-block whitespace-pre-wrap", className)} {...props}>
      <span className="sr-only">
        {prefix}
        {textArray[0]}
      </span>
      {prefix &&
        (typePrefix && !reduced ? (
          <>
            <span ref={prefixTypedRef} aria-hidden />
            {stableLayout && (
              <span ref={prefixRestRef} aria-hidden className="select-none text-transparent">
                {prefix}
              </span>
            )}
          </>
        ) : (
          <span aria-hidden>{prefix}</span>
        ))}
      <span ref={typedRef} aria-hidden>
        {reduced ? textArray[0] : null}
      </span>
      {showCursor && !reduced && (
        // An inline-block is a line-break opportunity, so a cursor in the middle of a word would let the
        // browser wrap "gove|rnance" early and make the paragraph jump. The word joiners (U+2060) on both
        // sides forbid a break there, so the invisible remainder alone decides every wrap.
        <span ref={cursorRef} aria-hidden className={cursorClassName}>
          {"⁠"}
          <span className={cn("inline-block", stableLayout ? "w-0 overflow-visible" : "ml-1")}>{cursorCharacter}</span>
          {"⁠"}
        </span>
      )}
      {stableLayout && !reduced && (
        <span ref={restRef} aria-hidden className="select-none text-transparent">
          {textArray[0]}
        </span>
      )}
    </Tag>
  );
}
