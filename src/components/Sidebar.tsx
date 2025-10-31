"use client";
import * as React from "react";
import { collection, onSnapshot, orderBy, query, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Avatar } from "./Avatar";
import { conversationIdFromUids } from "@/lib/conversations";
import { LogoutButton } from "./LogoutButton";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export function Sidebar({ onSelect, selectedUid, isMobile = false, onClose }: { onSelect: (uid: string) => void; selectedUid?: string | null; isMobile?: boolean; onClose?: () => void }) {
  const [user] = useAuthState(auth);
  const [users, setUsers] = React.useState<{ uid: string; email: string; displayName: string; photoURL?: string; lastSeen?: number; }[]>([]);
  const [now, setNow] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const q = query(collection(db, "users"), orderBy("lastSeen", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => d.data() as { uid: string; email: string; displayName: string; photoURL?: string; lastSeen?: number; }));
    });
    return () => unsub();
  }, []);

  // Debounce search for smoother filtering
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 200);
    return () => clearTimeout(id);
  }, [search]);

  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  async function startChat(otherUid: string) {
    if (!user?.uid || otherUid === user.uid) return;
    const cid = conversationIdFromUids(user.uid, otherUid);
    const payload = { members: [user.uid, otherUid] } as const;
    console.log("Conversations: creating/opening", { cid, payload });
    await setDoc(doc(db, "conversations", cid), payload, { merge: true });
    onSelect(otherUid);
  }

  function isOnline(ls?: number) {
    return !!ls && now - ls < 60_000; // last minute
  }

  const base = React.useMemo(() => users.filter(u => u.uid !== user?.uid), [users, user?.uid]);
  const filtered = React.useMemo(() => {
    if (!debounced) return base;
    return base.filter(u =>
      (u.displayName || "").toLowerCase().includes(debounced) ||
      (u.email || "").toLowerCase().includes(debounced)
    );
  }, [base, debounced]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      startChat(filtered[0].uid);
    }
  };

  // close menu on outside click
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <aside className={`${isMobile ? "flex w-full h-full" : "hidden md:flex md:w-80"} shrink-0 flex-col gap-4 p-4 border-r border-white/5 bg-black/30 backdrop-blur-md`}>
      {/* Mobile top bar */}
      {isMobile && (
        <div className="flex items-center justify-between">
          <button className="btn-ghost p-2 rounded-xl" aria-label="Back" onClick={onClose}>←</button>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Contacts</h3>
          <div className="relative" ref={menuRef}>
            <button className="btn-ghost p-2 rounded-xl" aria-label="Open menu" onClick={() => setMenuOpen((v) => !v)}>
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md shadow-lg overflow-hidden z-10"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                >
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/5" onClick={() => { setMenuOpen(false); router.push("/settings"); }}>Settings</button>
                  <div className="px-2 py-1">
                    <LogoutButton variant="ghost" className="w-full justify-start px-1 py-1.5 rounded-lg" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Desktop header with user */}
      {!isMobile && user && (
        <div className="flex items-center gap-3">
          <Avatar name={user.displayName || user.email || undefined} src={user.photoURL || undefined} size={40} shape="circle" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user.displayName || user.email}</div>
            <div className="truncate text-xs text-[var(--color-muted)]">You</div>
          </div>
          {/* Menu */}
          <div className="relative ml-auto" ref={menuRef}>
            <button className="btn-ghost p-2 rounded-xl" aria-label="Open menu" onClick={() => setMenuOpen((v) => !v)}>
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md shadow-lg overflow-hidden z-10"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                >
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/5" onClick={() => { setMenuOpen(false); router.push("/settings"); }}>Settings</button>
                  <div className="px-2 py-1">
                    <LogoutButton variant="ghost" className="w-full justify-start px-1 py-1.5 rounded-lg" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Contacts</h3>
        </div>
      )}
      {/* Search bar */}
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search by Gmail or name..."
          className="input"
          aria-label="Search users"
        />
        {/* Divider */}
        <div className="mt-3 border-b border-white/10" />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 pt-2 scroll-gradient">
        {filtered.length === 0 ? (
          <div className="mt-3 text-xs text-[var(--color-muted)] px-1">No user found</div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((u) => (
              <motion.button
                key={u.uid}
                onClick={() => startChat(u.uid)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${selectedUid === u.uid ? "bg-white/10" : "hover:bg-white/5"}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="relative">
                  <Avatar name={u.displayName} src={u.photoURL || undefined} />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--background)] ${isOnline(u.lastSeen)?"bg-emerald-400":"bg-zinc-500"}`} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{u.displayName || u.email}</div>
                  <div className="truncate text-xs text-[var(--color-muted)]">{u.email}</div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
