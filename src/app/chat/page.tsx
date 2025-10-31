"use client";
import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserDoc } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [selectedUid, setSelectedUid] = React.useState<string | null>(null);
  const [otherUser, setOtherUser] = React.useState<UserDoc | null>(null);
  const [showSidebar, setShowSidebar] = React.useState(false);

  const friendlyName = React.useMemo(() => {
    const dn = user?.displayName?.trim();
    if (dn) return dn;
    const email = user?.email || "";
    if (email.includes("@")) {
      const base = email.split("@")[0];
      const parts = base.split(/[._-]+/).filter(Boolean);
      const pretty = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
      return pretty || "Guest";
    }
    return "Guest";
  }, [user?.displayName, user?.email]);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  // On mobile, if no chat selected, show contacts panel by default
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selectedUid && window.innerWidth < 768) setShowSidebar(true);
  }, [selectedUid]);

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
      {/* Desktop sidebar */}
      <Sidebar onSelect={(uid) => { setSelectedUid(uid); setShowSidebar(false); }} selectedUid={selectedUid} />

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden={false}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)} />
            <motion.div
              className="absolute inset-0 w-full bg-black/30 backdrop-blur-md border-r border-white/5 p-4"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar isMobile onClose={() => setShowSidebar(false)} onSelect={(uid) => { setSelectedUid(uid); setShowSidebar(false); }} selectedUid={selectedUid} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col">
        {!selectedUid ? (
          <div className="flex-1 grid place-items-center p-6">
            <div className="text-center text-[var(--color-muted)]">
              <div className="text-xl font-semibold">Welcome, {friendlyName}!</div>
              <div className="mt-1">Select a contact to start chatting</div>
            </div>
          </div>
        ) : (
          <ChatWindow otherUser={otherUser} onOpenSidebar={() => setShowSidebar(true)} />
        )}
      </main>
    </div>
  );
}