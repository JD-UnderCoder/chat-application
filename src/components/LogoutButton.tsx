"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";

type Variant = "danger" | "ghost";

export function LogoutButton({ className = "", variant = "danger", onRequestInlineConfirm }: { className?: string; variant?: Variant; onRequestInlineConfirm?: (confirm: () => Promise<void>) => void }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOut(auth);
    } catch {
      // ignore
    } finally {
      try { sessionStorage.clear(); } catch {}
      try { localStorage.removeItem("uid"); localStorage.removeItem("email"); } catch {}
      router.replace("/auth");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (onRequestInlineConfirm) {
            onRequestInlineConfirm(handleLogout);
          } else {
            setConfirmOpen(true);
          }
        }}
        disabled={loading}
        className={`${variant === "danger" ? "bg-red-500 hover:bg-red-600 text-white" : "btn-ghost"} px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-60 ${className}`}
        aria-label="Logout"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center md:items-center md:justify-center p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden={false}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmOpen(false)}
            />

            {/* Mobile bottom sheet */}
            <motion.div
              role="dialog"
              aria-modal="true"
              className="md:hidden fixed inset-x-0 bottom-0 rounded-t-2xl auth-card p-5 shadow-2xl"
              initial={{ y: 48, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
              <div className="mb-2 text-base font-semibold">Confirm Logout</div>
              <p className="text-sm text-[var(--color-muted)]">Are you sure you want to logout?</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  className="btn-ghost w-full px-3 py-2 rounded-lg"
                  onClick={() => setConfirmOpen(false)}
                >
                  No
                </button>
                <button
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                  onClick={() => { setConfirmOpen(false); handleLogout(); }}
                >
                  Yes
                </button>
              </div>
            </motion.div>

            {/* Desktop centered modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              className="hidden md:block relative auth-card w-full max-w-sm p-6"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 text-lg font-semibold">Confirm Logout</div>
              <p className="text-sm text-[var(--color-muted)]">Are you sure you want to logout?</p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  className="btn-ghost px-3 py-1.5 rounded-lg"
                  onClick={() => setConfirmOpen(false)}
                >
                  No
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
                  onClick={() => { setConfirmOpen(false); handleLogout(); }}
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
