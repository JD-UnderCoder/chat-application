"use client";
import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserDoc } from "@/lib/types";

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
const [selectedUid, setSelectedUid] = React.useState<string | null>(null);
const [otherUser, setOtherUser] = React.useState<UserDoc | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  // Presence: update lastSeen periodically
  React.useEffect(() => {
    if (!user?.uid) return;
    const update = () => setDoc(
      doc(db, "users", user.uid),
      { lastSeen: Date.now(), updatedAt: serverTimestamp() },
      { merge: true }
    );
    update();
    const id = setInterval(update, 30_000);
    const vis = () => { if (document.visibilityState === "visible") update(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [user?.uid]);

  React.useEffect(() => {
    if (!selectedUid) { setOtherUser(null); return; }
const unsub = onSnapshot(doc(db, "users", selectedUid), (snap) => setOtherUser(snap.data() as UserDoc));
    return () => unsub();
  }, [selectedUid]);

  if (!user) return null;

  return (
    <div className="min-h-dvh flex">
      <Sidebar onSelect={setSelectedUid} selectedUid={selectedUid} />
      <main className="flex-1 flex flex-col">
        {!selectedUid ? (
          <div className="flex-1 grid place-items-center p-6">
            <div className="text-center text-[var(--color-muted)]">
              <div className="text-xl font-semibold">Welcome, {user.displayName || user.email}</div>
              <div className="mt-1">Select a contact to start chatting</div>
            </div>
          </div>
        ) : (
          <ChatWindow otherUser={otherUser} />
        )}
      </main>
    </div>
  );
}