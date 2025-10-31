"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_50%,rgba(0,0,0,0.55)_100%)]" />
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="auth-card card-hover w-full max-w-xl p-8 text-center">
          <div className="mx-auto mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white grid place-items-center shadow-lg">
            <span className="text-2xl font-bold">BC</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Business Chat</h1>
          <p className="mt-2 text-[15px] text-[var(--color-muted)]">
            A modern, business-themed chat platform with real-time messaging.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/auth" className="btn">Sign in</Link>
            <Link href="/chat" className="btn-ghost">Open app</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
