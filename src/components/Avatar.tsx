import * as React from "react";

export function Avatar({ name, src, size = 36 }: { name?: string; src?: string; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white grid place-items-center shadow"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "avatar"}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-semibold">{initials}</span>
      )}
    </div>
  );
}