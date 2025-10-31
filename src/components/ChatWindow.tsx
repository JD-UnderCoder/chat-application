"use client";
import * as React from "react";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, doc, setDoc } from "firebase/firestore";
import type { Message } from "@/lib/types";
import { db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Send, Smile, Paperclip, ArrowLeft } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import type { DocumentSnapshot } from "firebase/firestore";

export function ChatWindow({ otherUser, onOpenSidebar }: { otherUser?: { uid: string; displayName: string; email: string; photoURL?: string } | null, onOpenSidebar?: () => void }) {
  const [user] = useAuthState(auth);
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [otherTyping, setOtherTyping] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!user?.uid || !otherUser?.uid) return;
    const cid = [user.uid, otherUser.uid].sort().join("__");
    const q = query(collection(db, "conversations", cid, "messages"), orderBy("createdAt", "asc"), limit(200));
    const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }))));

    // typing listener for other user
    const typingDoc = doc(db, "conversations", cid, "typing", otherUser.uid);
    const unsubTyping = onSnapshot(typingDoc, (snap: DocumentSnapshot) => {
      const data = snap.data() as any;
      if (!data) { setOtherTyping(false); return; }
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : null;
      const fresh = updatedAt ? Date.now() - updatedAt.getTime() < 5000 : true;
      setOtherTyping(!!data.typing && fresh);
    });

    return () => { unsub(); unsubTyping(); };
  }, [user?.uid, otherUser?.uid]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || !user?.uid || !otherUser?.uid) {
      console.error("Missing required fields for message", { text: !!trimmed, senderId: user?.uid, receiverId: otherUser?.uid });
      return;
    }
    const cid = [user.uid, otherUser.uid].sort().join("__");
    const messagePayload = {
      text: trimmed || "",
      senderId: user.uid,
      receiverId: otherUser.uid,
      createdAt: serverTimestamp(),
    } as const;
    console.log("Messages: sending", { cid, messagePayload });
    await addDoc(collection(db, "conversations", cid, "messages"), messagePayload);
    setText("");
    // stop typing after send
    try {
      const typingPayload = { typing: false, updatedAt: serverTimestamp() } as const;
      console.log("Typing: clearing", { cid, typingPayload });
      await setDoc(doc(db, "conversations", cid, "typing", user.uid), typingPayload, { merge: true });
    } catch {}
  }

  return (
    <section className="flex flex-1 flex-col chat-bg">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/5 p-4">
        <button className="md:hidden btn-ghost p-2 rounded-xl" onClick={onOpenSidebar} aria-label="Back to contacts">
          <ArrowLeft size={18} />
        </button>
        {otherUser ? (
          <>
            <Avatar name={otherUser.displayName} src={otherUser.photoURL} />
            <div className="min-w-0">
              <div className="truncate font-medium">{otherUser.displayName || otherUser.email}</div>
              <div className="truncate text-xs text-[var(--color-muted)]">{otherUser.email}</div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  <Avatar name={user.displayName || user.email || undefined} src={user.photoURL || undefined} size={40} shape="circle" />
                  <div className="hidden sm:block min-w-0">
                    <div className="truncate text-sm font-medium">{user.displayName || user.email}</div>
                  </div>
                </div>
              )}
              <LogoutButton />
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--color-muted)]">Select a contact to start chatting</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-gradient">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.senderId !== m.senderId;
          const isMine = m.senderId === user?.uid;
          const avatarNode = isMine ? (
            <Avatar name={user?.displayName || user?.email || undefined} src={user?.photoURL || undefined} size={28} />
          ) : (
            <Avatar name={otherUser?.displayName} src={otherUser?.photoURL} size={28} />
          );
          return (
            <MessageBubble key={m.id} text={m.text} mine={isMine} ts={m.createdAt?.toDate?.()} avatar={avatarNode} showAvatar={showAvatar} />
          );
        })}
        {otherTyping && (
          <div className="text-xs text-white/70 italic px-2">{otherUser?.displayName || otherUser?.email} is typing...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="input-bar flex items-center gap-2">
          <button className="btn-ghost p-2 rounded-xl" aria-label="Emoji"><Smile size={18} /></button>
          <input
            value={text}
            onChange={async (e) => {
              const v = e.target.value;
              setText(v);
              // typing indicator
              if (user?.uid && otherUser?.uid) {
                const cid = [user.uid, otherUser.uid].sort().join("__");
                try {
                  const typingPayload = { typing: true, updatedAt: serverTimestamp() } as const;
                  console.log("Typing: setting", { cid, typingPayload });
                  await setDoc(doc(db, "conversations", cid, "typing", user.uid), typingPayload, { merge: true });
                } catch {}
              }
              if (typingTimer.current) clearTimeout(typingTimer.current);
              typingTimer.current = setTimeout(async () => {
                if (user?.uid && otherUser?.uid) {
                  const cid = [user.uid, otherUser.uid].sort().join("__");
                  try {
                    const typingPayload = { typing: false, updatedAt: serverTimestamp() } as const;
                    console.log("Typing: debounce clear", { cid, typingPayload });
                    await setDoc(doc(db, "conversations", cid, "typing", user.uid), typingPayload, { merge: true });
                  } catch {}
                }
              }, 1200);
            }}
            onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}
            placeholder="Type a message"
            className="flex-1 bg-transparent outline-none placeholder-white/50"
          />
          <button className="btn-ghost p-2 rounded-xl" aria-label="Attach"><Paperclip size={18} /></button>
          <button onClick={send} className="btn disabled:opacity-60" aria-label="Send" disabled={!otherUser?.uid || !text.trim()}><Send size={18}/></button>
        </div>
      </div>
    </section>
  );
}