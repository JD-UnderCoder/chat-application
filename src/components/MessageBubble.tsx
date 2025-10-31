import { format } from "date-fns";
import { motion } from "framer-motion";

export function MessageBubble({ text, mine, ts, avatar, showAvatar }: { text: string; mine?: boolean; ts?: Date; avatar?: React.ReactNode; showAvatar?: boolean }) {
  return (
    <motion.div
      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {!mine && showAvatar && <div className="self-end">{avatar}</div>}
      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${mine ? "bubble-me rounded-br-md" : "bubble-them rounded-bl-md"}`}>
        <p className="text-[15px] leading-relaxed">{text}</p>
        {ts && <div className={`mt-1 text-[11px] ${mine?"text-white/80":"text-white/70"}`}>{format(ts, "p")}</div>}
      </div>
      {mine && showAvatar && <div className="self-end">{avatar}</div>}
    </motion.div>
  );
}
