"use client";

import { useRef, useState } from "react";
import { Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const clock = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/**
 * Video with a designed control layer. Idle: one green "Watch demo" pill in the middle. Playing: the
 * pill leaves and a glass dock rises from the bottom edge (play/pause, scrubbable progress, time, sound)
 * on hover or focus. The dock stays visible while paused mid-clip and always on touch screens.
 */
export function VideoPlayer({
  sources,
  poster,
  label = "Watch demo",
}: {
  sources: { src: string; type: string }[];
  poster?: string;
  label?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  // Progress and time are written straight to the DOM: no re-render per tick
  const sync = () => {
    const el = video.current;
    if (!el) return;
    const pct = el.duration ? (el.currentTime / el.duration) * 100 : 0;
    if (fill.current) fill.current.style.width = `${pct}%`;
    if (time.current) time.current.textContent = `${clock(el.currentTime)} / ${clock(el.duration)}`;
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = video.current;
    if (!el?.duration) return;
    el.currentTime = (Number(e.target.value) / 100) * el.duration;
    sync();
  };

  return (
    <div className="group/player relative size-full bg-ink-900">
      {/* Designed backdrop so the frame is never a blank void before the first frame arrives */}
      <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgb(74_224_87/0.14),transparent_70%)]"
      />

      <video
        ref={video}
        poster={poster}
        className="absolute inset-0 size-full object-cover"
        playsInline
        preload="metadata"
        loop
        muted={muted}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={sync}
        onLoadedMetadata={sync}
        onClick={toggle}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Scrim: heavy while idle so the pill reads on any frame, off while playing */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-ink-950/40 transition-opacity duration-700",
          playing ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Idle call to action */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center transition-all duration-500 ease-out-expo",
          started ? "scale-90 opacity-0" : "scale-100 opacity-100",
        )}
      >
        <button
          type="button"
          onClick={toggle}
          tabIndex={started ? -1 : 0}
          className="pointer-events-auto group/cta flex items-center gap-3 rounded-full border border-white/15 bg-ink-950/70 py-2 pl-2 pr-6 text-sm font-semibold text-fg shadow-panel transition-all duration-300 ease-out-expo hover:border-accent/60 hover:bg-ink-950/85 active:scale-[0.97] sm:text-base"
        >
          <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink shadow-accent transition-transform duration-300 ease-out-expo group-hover/cta:scale-110 sm:size-14">
            <Play weight="fill" className="ml-0.5 size-5 sm:size-6" />
          </span>
          {label}
        </button>
      </div>

      {/* Control dock */}
      <div
        className={cn(
          "absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-full border border-white/12 bg-ink-950/80 p-2 pr-4 text-fg shadow-panel transition-all duration-500 ease-out-expo sm:inset-x-6 sm:bottom-6",
          started
            ? "translate-y-0 opacity-100 [@media(hover:hover)]:group-hover/player:translate-y-0"
            : "pointer-events-none translate-y-4 opacity-0",
          playing &&
            "[@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/player:translate-y-0 [@media(hover:hover)]:group-hover/player:opacity-100 [@media(hover:hover)]:group-has-[:focus-visible]/player:translate-y-0 [@media(hover:hover)]:group-has-[:focus-visible]/player:opacity-100",
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause video" : "Play video"}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-all duration-200 hover:bg-accent-hover active:scale-90"
        >
          {playing ? <Pause weight="fill" className="size-4" /> : <Play weight="fill" className="ml-0.5 size-4" />}
        </button>

        <div className="relative h-1.5 flex-1 rounded-full bg-white/15">
          <span ref={fill} className="absolute inset-y-0 left-0 w-0 rounded-full bg-accent transition-[width] duration-200 ease-linear" />
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            defaultValue={0}
            onChange={seek}
            aria-label="Seek"
            className="absolute -inset-y-3 inset-x-0 w-full cursor-pointer opacity-0"
          />
        </div>

        <span ref={time} className="type-caption hidden w-24 shrink-0 text-right tabular-nums text-fg-muted sm:block">
          0:00 / 0:00
        </span>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="grid size-9 shrink-0 place-items-center rounded-full text-fg-muted transition-colors hover:bg-white/10 hover:text-fg"
        >
          {muted ? <SpeakerSlash weight="fill" className="size-5" /> : <SpeakerHigh weight="fill" className="size-5" />}
        </button>
      </div>

      {/* Keep the state announced for screen readers */}
      <span className="sr-only" aria-live="polite">
        {playing ? "Playing" : started ? "Paused" : ""}
      </span>
    </div>
  );
}
