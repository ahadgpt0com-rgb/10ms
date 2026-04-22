"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function PinLoginScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<"pin" | "name">("pin");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWarningPopup, setShowWarningPopup] = useState(false);

  useEffect(() => {
    if (user && !authLoading && !showWarningPopup) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router, showWarningPopup]);

  const handlePinComplete = async (enteredPin: string) => {
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 400));
      if (enteredPin === "2526") {
        setStep("name");
      } else {
        setError("Access Denied.");
        setPin("");
      }
    } catch (err: any) {
      setError(err.message || "Invalid PIN");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4 && step === "pin") {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      handlePinComplete(pin);
    }
  }, [pin, step]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      let deviceId = localStorage.getItem("hsc26_device_id");
      if (!deviceId) {
         deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
         localStorage.setItem("hsc26_device_id", deviceId);
      }
      
      const email = `student_${deviceId}@10ms.community`;
      const password = `secure_${deviceId}_pass!`;
      
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          username: name.trim(),
          role: "student"
        }, { merge: true });
        setShowWarningPopup(true);
      } catch (e: any) {
        if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
           const cred = await createUserWithEmailAndPassword(auth, email, password);
           await setDoc(doc(db, "users", cred.user.uid), {
             username: name.trim(),
             role: "student",
             createdAt: Date.now()
           });
           setShowWarningPopup(true);
        } else {
           throw e;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Make sure Email/Password is enabled in Firebase Console.");
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
      if (step !== "pin") return;
      if (/^[0-9]$/.test(e.key)) {
        if (!loading && pin.length < 4) setPin(p => p + e.key);
      } else if (e.key === "Backspace") {
        if (!loading) setPin(p => p.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, loading, step]);

  if (showWarningPopup) {
    return (
      <div className="min-h-screen bg-nat-bg flex flex-col items-center justify-center p-4">
        {/* Background logic showing the page state frozen over */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <h1 className="text-4xl font-serif italic text-nat-accent mb-2">10ms-hsc-26</h1>
          <p className="text-nat-muted mb-12 text-xs uppercase tracking-widest font-semibold">Security Active</p>
          
          <div className="flex gap-6 mb-8 h-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="w-4 h-4 rounded-full bg-nat-accent transition-all duration-300" />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-6 opacity-30 pointer-events-none">
            {['1','2','3','4','5','6','7','8','9'].map(num => (
              <button key={num} className="w-16 h-16 rounded-full bg-white text-2xl flex items-center justify-center shadow-nat-card border border-nat-border">{num}</button>
            ))}
            <div />
            <button className="w-16 h-16 rounded-full bg-white text-2xl flex items-center justify-center shadow-nat-card border border-nat-border">0</button>
            <div />
          </div>
        </div>
        
        {/* Modal Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-transparent shadow-none w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h2 className="text-2xl font-serif text-red-500 font-bold mb-3 tracking-tight">সতর্কবার্তা</h2>
            <p className="text-gray-800 mb-8 font-semibold">Do not share PIN anyone.</p>
            <button
              onClick={() => {
                 setShowWarningPopup(false);
                 router.push("/dashboard");
              }}
              className="w-full py-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all shadow-md"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-nat-bg flex items-center justify-center">
        <span className="text-lg font-medium text-nat-muted animate-pulse">Loading My Space...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nat-bg flex flex-col items-center justify-center p-4">
      {step === "pin" ? (
        <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in duration-300">
          <h1 className="text-4xl font-serif italic text-nat-accent mb-2">10ms-hsc-26</h1>
          <p className="text-nat-muted mb-12 text-xs uppercase tracking-widest font-semibold">Security Active</p>
          
          {/* PIN Dots */}
          <div className="flex gap-6 mb-8 h-4">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index} 
                className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > index ? (error ? 'bg-red-400' : 'bg-nat-accent scale-110 shadow-sm') : 'bg-[#E0DDD7]'}`} 
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-6">{error}</p>}

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
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-right-8 duration-300">
          <div className="w-20 h-20 bg-nat-sidebar rounded-full flex items-center justify-center mb-6 shadow-sm border border-nat-border">
            <svg className="w-10 h-10 text-nat-accent" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 className="text-2xl font-serif text-nat-text font-bold mb-2">Your Identity</h2>
          <p className="text-nat-muted mb-8 text-center text-[15px]">Please enter your name to join the community.</p>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleNameSubmit} className="w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Type your name plz"
              className="w-full bg-white border border-nat-border rounded-xl px-4 py-4 mb-4 text-center text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-nat-accent transition-all"
              autoFocus
            />
            <button 
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-4 rounded-xl font-semibold text-white bg-nat-accent hover:bg-nat-accent/90 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Joining..." : "Continue"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
