"use client";
import * as React from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function AuthForm() {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: email,
          displayName: name || email.split("@")[0],
          photoURL: cred.user.photoURL || null,
          lastSeen: Date.now(),
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-hover w-full max-w-md p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white grid place-items-center shadow">
          <span className="text-sm font-bold">BC</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Welcome</h2>
          <p className="text-sm text-[var(--color-muted)]">Sign in to your account</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "signup" && (
          <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      <div className="mt-4 text-center text-sm text-[var(--color-muted)]">
        {mode === "signup" ? (
          <button className="btn-ghost" onClick={() => setMode("signin")}>Have an account? Sign in</button>
        ) : (
          <button className="btn-ghost" onClick={() => setMode("signup")}>New here? Create an account</button>
        )}
      </div>
    </div>
  );
}