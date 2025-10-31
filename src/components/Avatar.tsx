import * as React from "react";

export function Avatar({ name, src, size = 36, shape = "rounded", className = "" }: { name?: string; src?: string; size?: number; shape?: "rounded" | "circle"; className?: string }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const rounding = shape === "circle" ? "rounded-full" : "rounded-xl";
  return (
    <div
      className={`${rounding} bg-gradient-to-br from-emerald-400 to-emerald-600 text-white grid place-items-center shadow ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "avatar"}
          className={`w-full h-full object-cover ${rounding}`}
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-semibold">{initials}</span>
      )}
    </div>
  );
}
