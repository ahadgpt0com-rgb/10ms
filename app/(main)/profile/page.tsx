"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Link as LinkIcon, Save, Activity, Users } from "lucide-react";

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
  
  const [allUsers, setAllUsers] = useState<{id: string, username: string}[]>([]);

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
    
    // All users list
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username
      }));
      setAllUsers(usersList);
    });

    return () => {
       unsubLink();
       unsubViews();
       unsubUsers();
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

    if (!user) {
      setAdminError("User not signed in.");
      setAdminLoading(false);
      return;
    }

    if (adminPassword === "mogamoga") {
      const email = "admin_boss@myspace.app";
      const password = "secure_mogamoga!";
      try {
        await setDoc(doc(db, "users", user.uid), {
          role: "admin"
        }, { merge: true });
        
        // Relogin implicitly happens via snapshot or reload
        window.location.reload();
      } catch (e: any) {
         setAdminError("Failed to elevate privileges.");
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
          <Card className="rounded-2xl shadow-nat-card border border-nat-border bg-white overflow-hidden relative">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-nat-accent" />
                <h3 className="text-lg font-semibold text-nat-text">Community Members</h3>
              </div>
              <p className="text-sm text-nat-muted mb-6">List of all members who have joined with their identities.</p>
              
              <div className="bg-nat-bg border border-nat-border rounded-xl p-4 max-h-[300px] overflow-y-auto">
                {allUsers.length > 0 ? (
                  <ul className="space-y-3">
                    {allUsers.map((u, i) => (
                      <li key={u.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-nat-sidebar flex items-center justify-center text-xs font-bold text-nat-accent uppercase shrink-0">
                          {u.username ? u.username.charAt(0) : "U"}
                        </div>
                        <span className="text-sm font-medium text-nat-text">{u.username}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-nat-muted text-center py-4">No members yet.</p>
                )}
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
