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
      // Ensure user doc exists and lastSeen is set
      setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0],
          photoURL: user.photoURL || null,
          lastSeen: Date.now(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      router.replace("/chat");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <AuthForm />
    </div>
  );
}