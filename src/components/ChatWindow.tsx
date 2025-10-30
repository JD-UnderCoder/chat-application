"use client";
import * as React from "react";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import type { Message } from "@/lib/types";
import { db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Send, LogOut } from "lucide-react";

export function ChatWindow({ otherUser }: { otherUser?: { uid: string; displayName: string; email: string; photoURL?: string } | null }) {
  const [user] = useAuthState(auth);
  const [text, setText] = React.useState("");
const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    if (!user?.uid || !otherUser?.uid) return;
    const cid = [user.uid, otherUser.uid].sort().join("__");
    const q = query(collection(db, "conversations", cid, "messages"), orderBy("createdAt", "asc"), limit(200));
const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }))));
    return () => unsub();
  }, [user?.uid, otherUser?.uid]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || !user?.uid || !otherUser?.uid) return;
    const cid = [user.uid, otherUser.uid].sort().join("__");
    await addDoc(collection(db, "conversations", cid, "messages"), {
      text: trimmed,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
    setText("");
  }

  return (
    <section className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/5 p-4">
        {otherUser ? (
          <>
            <Avatar name={otherUser.displayName} src={otherUser.photoURL} />
            <div className="min-w-0">
              <div className="truncate font-medium">{otherUser.displayName || otherUser.email}</div>
              <div className="truncate text-xs text-[var(--color-muted)]">{otherUser.email}</div>
            </div>
            <div className="ml-auto">
              <form action={() => auth.signOut()}>
                <button type="submit" className="btn-ghost"><LogOut size={18}/> Logout</button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--color-muted)]">Select a contact to start chatting</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-gradient">
        {messages.map((m) => (
          <MessageBubble key={m.id} text={m.text} mine={m.senderId===user?.uid} ts={m.createdAt?.toDate?.()} avatar={<Avatar name={otherUser?.displayName} src={otherUser?.photoURL} size={28} />} />
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}
            placeholder="Type a message"
            className="input"
          />
<button onClick={send} className="btn" aria-label="Send"><Send size={18}/></button>
        </div>
      </div>
    </section>
  );
}