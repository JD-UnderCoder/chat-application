"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function AuthPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Ensure user doc exists and lastSeen is set (sanitize undefined/null)
      const email = user.email || "";
      const displayName = (user.displayName || (email.includes("@") ? email.split("@")[0] : "Guest")).trim();
      const photoURL = user.photoURL || "";
      const data = {
        uid: user.uid,
        email,
        emailLower: email.trim().toLowerCase(),
        displayName,
        name: displayName.toLowerCase(),
        photoURL,
        lastSeen: Date.now(),
        updatedAt: serverTimestamp(),
      };
      console.log("Auth: saving user doc", data);
      setDoc(doc(db, "users", user.uid), data, { merge: true });
      router.replace("/chat");
    }
  }, [user, loading, router]);

  return (
    <div className="relative min-h-screen">
      {/* Full-page background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />
      {/* Dark overlay to maintain dark theme */}
      <div className="absolute inset-0 bg-black/70" />
      {/* Content */}
      <div className="relative min-h-screen grid place-items-center p-6">
        <AuthForm />
      </div>
    </div>
  );
}