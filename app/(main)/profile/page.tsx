"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (user && dataUrl) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            profilePic: dataUrl
          });
          setError("");
        } catch (e) {
          console.error(e);
          setError("Failed to upload. Rules blocked or network issue.");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif text-nat-text mb-2">My Profile</h1>
        <p className="text-nat-muted">Manage your personal information and student avatar.</p>
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

              <div className="pt-4 space-y-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <Button 
                  onClick={handleUploadClick}
                  className="w-full md:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
