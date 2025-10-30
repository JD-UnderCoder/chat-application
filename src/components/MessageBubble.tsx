import { format } from "date-fns";

export function MessageBubble({ text, mine, ts, avatar }: { text: string; mine?: boolean; ts?: Date; avatar?: React.ReactNode }) {
  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && <div className="self-end">{avatar}</div>}
      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${mine ? "bubble-me rounded-br-md" : "bubble-them rounded-bl-md"}`}>
        <p className="text-[15px] leading-relaxed">{text}</p>
        {ts && <div className={`mt-1 text-[11px] ${mine?"text-white/80":"text-[var(--color-muted)]"}`}>{format(ts, "p")}</div>}
      </div>
    </div>
  );
}