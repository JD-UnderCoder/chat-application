"use client";
import * as React from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

function mapFirebaseError(err: unknown): string {
  const code = (typeof err === "object" && err && (err as any).code) || "";
  switch (code) {
    case "auth/invalid-credential":
      return "❌ Wrong email or password. Please try again.";
    case "auth/user-not-found":
      return "⚠️ Account not found. Please sign up first.";
    case "auth/wrong-password":
      return "❌ Incorrect password. Try again.";
    case "auth/email-already-in-use":
      return "⚠️ This email is already registered. Please log in instead.";
    default:
      return "Something went wrong. Please try again.";
  }
}

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
          displayName: (name || email.split("@")[0]).trim(),
          photoURL: cred.user.photoURL || "",
          lastSeen: Date.now(),
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="auth-card card-hover w-full max-w-md p-6">
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
          <input className="input" placeholder="Full name" value={name} onChange={onNameChange} />
        )}
        <input className="input" placeholder="Email" type="email" value={email} onChange={onEmailChange} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={onPasswordChange} />
        {error && (
          <motion.p
            className="text-red-500 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
        <button className="btn w-full" disabled={loading}>{loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      <div className="mt-4 text-center text-sm text-[var(--color-muted)]">
        {mode === "signup" ? (
          <button className="btn-ghost" onClick={() => { setMode("signin"); setError(null); }}>Have an account? Sign in</button>
        ) : (
          <button className="btn-ghost" onClick={() => { setMode("signup"); setError(null); }}>New here? Create an account</button>
        )}
      </div>
    </div>
  );
}
