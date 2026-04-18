"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function PinLoginScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (pin.length === 4) {
      handlePinComplete(pin);
    }
  }, [pin]);

  const handlePinComplete = async (enteredPin: string) => {
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 400));
      if (enteredPin === "2526") {
        const email = "journal2526@myspace.app";
        const password = "secure2526_password!";
        
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (e: any) {
          if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
             const cred = await createUserWithEmailAndPassword(auth, email, password);
             await setDoc(doc(db, "users", cred.user.uid), {
               username: "My Journal",
               createdAt: Date.now()
             });
          } else {
             console.error(e);
             throw new Error("Make sure Email/Password is enabled in Firebase Console.");
          }
        }
      } else {
        setError("Access Denied.");
        setPin("");
      }
    } catch (err: any) {
      alert(err.message || "Login failed");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (key: string) => {
    if (loading || pin.length >= 4) return;
    setPin(p => p + key);
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin(p => p.slice(0, -1));
  };

  // Add physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKey(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, loading]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-nat-bg flex items-center justify-center">
        <span className="text-lg font-medium text-nat-muted animate-pulse">Loading CampusConnect...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nat-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="text-4xl font-serif italic text-nat-accent mb-2">My Space</h1>
        <p className="text-nat-muted mb-12 text-xs uppercase tracking-widest font-semibold">Security Active</p>
        
        {/* PIN Dots */}
        <div className="flex gap-6 mb-12 h-4">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > index ? (error ? 'bg-red-400' : 'bg-nat-accent scale-110 shadow-sm') : 'bg-[#E0DDD7]'}`} 
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6">
          {['1','2','3','4','5','6','7','8','9'].map(num => (
            <button 
              key={num} 
              disabled={loading}
              onClick={() => handleKey(num)} 
              className="w-16 h-16 rounded-full bg-white text-2xl font-sans font-medium hover:bg-nat-sidebar hover:scale-105 active:scale-95 transition-all text-nat-text flex items-center justify-center shadow-nat-card border border-nat-border disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div />
          <button 
            disabled={loading}
            onClick={() => handleKey('0')} 
            className="w-16 h-16 rounded-full bg-white text-2xl font-sans font-medium hover:bg-nat-sidebar hover:scale-105 active:scale-95 transition-all text-nat-text flex items-center justify-center shadow-nat-card border border-nat-border disabled:opacity-50"
          >
            0
          </button>
          <button 
            disabled={loading}
            onClick={handleBackspace} 
            className="w-16 h-16 rounded-full text-nat-muted hover:text-nat-text flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
