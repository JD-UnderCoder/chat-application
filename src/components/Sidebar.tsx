"use client";
import * as React from "react";
import { collection, onSnapshot, orderBy, query, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Avatar } from "./Avatar";
import { conversationIdFromUids } from "@/lib/conversations";

export function Sidebar({ onSelect, selectedUid }: { onSelect: (uid: string) => void; selectedUid?: string | null }) {
  const [user] = useAuthState(auth);
  const [users, setUsers] = React.useState<{ uid: string; email: string; displayName: string; photoURL?: string; lastSeen?: number; }[]>([]);
const [now, setNow] = React.useState<number>(0);

  React.useEffect(() => {
    const q = query(collection(db, "users"), orderBy("lastSeen", "desc"));
    const unsub = onSnapshot(q, (snap) => {
setUsers(snap.docs.map((d) => d.data() as { uid: string; email: string; displayName: string; photoURL?: string; lastSeen?: number; }));
    });
    return () => unsub();
  }, []);

React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  async function startChat(otherUid: string) {
    if (!user?.uid || otherUid === user.uid) return;
    const cid = conversationIdFromUids(user.uid, otherUid);
    await setDoc(doc(db, "conversations", cid), { members: [user.uid, otherUid] }, { merge: true });
    onSelect(otherUid);
  }

  function isOnline(ls?: number) {
    return !!ls && now - ls < 60_000; // last minute
  }

  return (
    <aside className="hidden md:flex md:w-80 shrink-0 flex-col gap-3 p-4 border-r border-white/5 bg-black/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Contacts</h3>
      </div>
      <div className="space-y-2 overflow-y-auto pr-2 scroll-gradient">
        {users.map((u) => (
          <button
            key={u.uid}
            onClick={() => startChat(u.uid)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${selectedUid===u.uid?"bg-white/10":"hover:bg-white/5"}`}
          >
            <div className="relative">
              <Avatar name={u.displayName} src={u.photoURL || undefined} />
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--background)] ${isOnline(u.lastSeen)?"bg-emerald-400":"bg-zinc-500"}`} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{u.displayName || u.email}</div>
              <div className="truncate text-xs text-[var(--color-muted)]">{u.email}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}