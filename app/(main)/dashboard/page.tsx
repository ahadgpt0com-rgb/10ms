"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Post[];
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        content: newPost.trim(),
        createdAt: Date.now()
      });
      setNewPost("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this message?")) {
       try {
         await deleteDoc(doc(db, "posts", postId));
       } catch (e: any) {
         console.error(e);
         alert("Delete Failed: " + (e.message || "Permission Denied"));
       }
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-nat-text mb-2">Share Your Story</h1>
        <p className="text-nat-muted">A private space for your thoughts, completely locked and secure.</p>
      </div>

      <Card className="bg-white rounded-3xl shadow-nat-card border-none">
        <CardContent className="p-6">
          <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
            <textarea
              className="w-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-nat-text text-lg placeholder-nat-muted min-h-[100px]"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind today...?"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newPost.trim() || isSubmitting} className="rounded-full px-6">
                Save Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6 mt-8">
        {posts.map((post) => (
          <Card key={post.id} className="transition-all rounded-3xl shadow-nat-card border-none bg-[#fdfbf7]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-nat-accent tracking-wide uppercase">
                  {new Date(post.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                </span>
                {user.role === "admin" && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-nat-muted hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-nat-text text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-16 text-nat-muted italic">
            Your journal is empty. Write your first entry above.
          </div>
        )}
      </div>
    </div>
  );
}
