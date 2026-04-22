"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Link as LinkIcon, Save, Activity } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [groupLink, setGroupLink] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (user?.role !== "admin") return;
    
    // Group link
    const unsubLink = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
       if (docSnap.exists() && docSnap.data().whatsappLink) {
         setGroupLink(docSnap.data().whatsappLink);
       }
    });

    // Analytics
    const unsubViews = onSnapshot(doc(db, "settings", "analytics"), (docSnap) => {
       if (docSnap.exists() && docSnap.data().totalViews) {
         setTotalViews(docSnap.data().totalViews);
       }
    });

    return () => {
       unsubLink();
       unsubViews();
    };
  }, [user]);

  const handleSaveLink = async () => {
    setIsSavingLink(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        whatsappLink: groupLink
      }, { merge: true });
      alert("WhatsApp link updated globally!");
    } catch(e) {
      console.error(e);
      alert("Failed to update link");
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");

    if (adminPassword === "mogamoga") {
      const email = "admin_boss@myspace.app";
      const password = "secure_mogamoga!";
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } catch (e: any) {
         if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", cred.user.uid), {
              username: "Admin",
              role: "admin",
              createdAt: Date.now()
            });
            router.push("/dashboard");
         } else {
            setAdminError(e.message);
         }
      }
    } else {
      setAdminError("Invalid admin access key.");
    }
    setAdminLoading(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif text-nat-text mb-2">Settings</h1>
        <p className="text-nat-muted">Manage your personal information, avatar, and system access.</p>
      </div>

      <Card className="rounded-2xl shadow-nat-card border-none bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative group">
                {user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt="Profile" 
                    className="w-40 h-40 rounded-full object-cover shadow-md border-4 border-nat-sidebar"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-nat-sidebar border-4 border-white shadow-md flex items-center justify-center text-nat-accent text-5xl font-bold uppercase">
                    {user.username.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4 pt-2">
              <div>
                <h2 className="text-2xl font-semibold text-nat-text">{user.username}</h2>
                <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nat-sidebar text-sm font-medium text-nat-muted capitalize">
                  {user.role} Account
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {user.role === "admin" && (
        <div className="space-y-6 mt-8">
          <Card className="rounded-2xl shadow-nat-card border border-nat-border bg-white overflow-hidden relative">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-nat-accent" />
                    <h3 className="text-lg font-semibold text-nat-text">Website Analytics</h3>
                  </div>
                  <p className="text-sm text-nat-muted">Total number of unique device visits to the platform.</p>
                </div>
                <div className="text-4xl font-serif text-nat-accent font-bold bg-nat-sidebar px-6 py-4 rounded-2xl">
                  {totalViews}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-nat-card border border-nat-border bg-white overflow-hidden relative">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-5 h-5 text-nat-accent" />
                <h3 className="text-lg font-semibold text-nat-text">WhatsApp Group Link</h3>
              </div>
              <p className="text-sm text-nat-muted mb-6">Update the link that users use to join the community.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="flex-1 bg-nat-sidebar border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nat-accent transition-all"
                />
                <Button 
                  onClick={handleSaveLink}
                  disabled={!groupLink || isSavingLink} 
                  className="rounded-xl py-6 px-8 shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingLink ? "Saving..." : "Save Link"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role !== "admin" && (
        <Card className="rounded-2xl shadow-nat-card border border-red-100 bg-white mt-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-500">Admin Portal</h3>
            </div>
            <p className="text-sm text-nat-muted mb-6">Enter the master passcode to elevate your session privileges.</p>
            
            <form onSubmit={handleAdminLogin} className="flex flex-col sm:flex-row gap-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter passcode..."
                className="flex-1 bg-nat-sidebar border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all font-mono"
              />
              <Button 
                type="submit" 
                disabled={!adminPassword || adminLoading} 
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl py-6 px-8 shadow-sm"
              >
                {adminLoading ? "Authenticating..." : "Authorize"}
              </Button>
            </form>
            {adminError && <p className="text-red-500 text-sm mt-3">{adminError}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
