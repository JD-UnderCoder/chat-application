import { MessageBubble } from "./MessageBubble";

export default function ChatPreview() {
  const now = new Date();
  return (
    <div className="auth-card w-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-xl text-[var(--foreground)]/95 filter blur-[2px] md:blur-[3px] lg:blur-[4px] pointer-events-none select-none">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <div className="h-8 w-8 rounded-full bg-emerald-500/90" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">Taylor (You)</div>
          <div className="truncate text-xs text-[var(--color-muted)]">Active now</div>
        </div>
      </div>
      {/* Messages */}
      <div className="max-h-[420px] overflow-hidden p-4 space-y-3">
        <MessageBubble text="Hey! Ready to review the Q4 plan?" ts={now} />
        <MessageBubble text="Absolutely — give me 2 mins." mine ts={now} />
        <MessageBubble text="Sending the deck now. Check slide 12 for the new projections." ts={now} />
        <MessageBubble text="Nice! The growth curve looks solid." mine ts={now} />
        <MessageBubble text="Let's sync at 3 PM to finalize." ts={now} />
      </div>
      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="input flex-1">Type a message</div>
          <div className="btn">Send</div>
        </div>
      </div>
    </div>
  );
}
