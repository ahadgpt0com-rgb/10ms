"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, deleteField } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Hash } from "lucide-react";

interface Post {
  id: string;
  userId: string;
  content: string;
  authorName?: string;
  createdAt: number;
  reactions?: Record<string, string>;
}

// Extracted WhatsApp custom icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.914 6.544l-1.884 5.64 5.86-1.859A11.94 11.94 0 0 0 11.944 24 12 12 0 0 0 24 12 12 12 0 0 0 11.944 0zm0 22.022a9.92 9.92 0 0 1-5.06-1.385l-.36-.214-3.41 1.08.913-3.32-.236-.375a9.96 9.96 0 0 1-1.524-5.289A10.02 10.02 0 0 1 11.944 1.978a10.02 10.02 0 0 1 10.038 10.044 10.02 10.02 0 0 1-10.038 10.0z"/>
      <path d="M17.433 13.918c-.3-.153-1.774-.877-2.05-.977-.275-.1-.476-.153-.676.151-.2.302-.776.977-.95 1.176-.176.202-.352.226-.653.076-.3-.151-1.267-.468-2.414-1.493-.895-.8-1.5-1.787-1.675-2.088-.176-.301-.019-.464.131-.614.135-.136.301-.352.451-.528.151-.176.201-.301.301-.502.1-.201.05-.377-.025-.528-.075-.15-.676-1.63-.926-2.232-.245-.589-.494-.509-.676-.518-.176-.009-.376-.009-.576-.009a1.104 1.104 0 0 0-.796.376c-.276.301-1.053 1.03-1.053 2.512s1.078 2.911 1.228 3.111c.151.201 2.122 3.24 5.138 4.542.718.31 1.278.495 1.716.634.72.228 1.375.195 1.892.118.579-.086 1.774-.725 2.025-1.428.251-.703.251-1.305.176-1.43-.076-.124-.276-.2-.577-.35z"/>
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hashtag logic
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [hashtagQuery, setHashtagQuery] = useState<{ match: string; index: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allHashtags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      const matches = post.content.match(/#[\w]+/g);
      if (matches) {
         matches.forEach(m => tags.add(m));
      }
    });
    return Array.from(tags);
  }, [posts]);

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewPost(val);
    
    const cursorP = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorP);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('#')) {
      const q = lastWord.toLowerCase();
      // Suggest tags that start with the query, excluding the exact same tag if it's already complete
      const matches = allHashtags.filter(t => t.toLowerCase().startsWith(q) && t.toLowerCase() !== q);
      setSuggestedHashtags(matches.slice(0, 5));
      if (matches.length > 0) {
        setHashtagQuery({ match: lastWord, index: cursorP - lastWord.length });
      } else {
        setHashtagQuery(null);
      }
    } else {
      setHashtagQuery(null);
    }
  };

  const handleHashtagSelect = (tag: string) => {
    if (!hashtagQuery || !textareaRef.current) return;
    
    const before = newPost.slice(0, hashtagQuery.index);
    // Remove the partial hashtag and add the selected one
    const partialMatchLength = hashtagQuery.match.length;
    const after = newPost.slice(hashtagQuery.index + partialMatchLength);
    
    const newValue = `${before}${tag} ${after}`;
    setNewPost(newValue);
    setHashtagQuery(null);
    setSuggestedHashtags([]);
    
    // Set focus back
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = before.length + tag.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

  const handleReaction = async (postId: string, currentReactions: Record<string, string> = {}, emoji: string) => {
    if (!user) return;
    const postRef = doc(db, "posts", postId);
    const currentReaction = currentReactions[user.uid];
    
    try {
      if (currentReaction === emoji) {
        // Toggle off
        await updateDoc(postRef, {
          [`reactions.${user.uid}`]: deleteField()
        });
      } else {
        // Set new reaction
        await updateDoc(postRef, {
          [`reactions.${user.uid}`]: emoji
        });
      }
    } catch(e) { 
      console.error("Failed to react to post", e); 
      alert("Reaction limit reached or permission denied.");
    }
  };

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
        authorName: user.username || "Member",
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

  const [whatsappGroupLink, setWhatsappGroupLink] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().whatsappLink) {
        setWhatsappGroupLink(docSnap.data().whatsappLink);
      }
    }, (err) => {
       console.warn("Failed to listen to global settings:", err);
    });
    return () => unsub();
  }, [user]);

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif text-nat-text mb-2">Share Your Story</h1>
          <p className="text-nat-muted">A private space for your thoughts, completely locked and secure.</p>
        </div>
        
        {/* WhatsApp Link directly in the header */}
        {whatsappGroupLink && (
          <a
            href={whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 mt-1 flex items-center justify-center p-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors shadow-sm"
            title="Join WhatsApp Group"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </a>
        )}
      </div>

      <Card className="bg-white rounded-3xl shadow-nat-card border-none overflow-visible">
        <CardContent className="p-6 relative">
          <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
            <textarea
              ref={textareaRef}
              className="w-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-nat-text text-lg placeholder-nat-muted min-h-[100px]"
              value={newPost}
              onChange={handlePostChange}
              placeholder="What's on your mind today...? (Type # for hashtags)"
              disabled={isSubmitting}
            />
            {suggestedHashtags.length > 0 && (
              <div className="absolute top-[80%] left-6 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-nat-border overflow-hidden z-20 min-w-[200px]">
                {suggestedHashtags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleHashtagSelect(tag)}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-nat-sidebar text-nat-text font-medium text-sm transition-colors border-b border-nat-border last:border-0"
                  >
                    <span className="text-nat-accent bg-nat-accent/10 p-1.5 rounded-md"><Hash className="w-3 h-3" /></span>
                    {tag.replace('#', '')}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end relative z-10">
              <Button type="submit" disabled={!newPost.trim() || isSubmitting} className="rounded-full px-6">
                Save Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card className="rounded-3xl shadow-nat-card border-none bg-[#fdfbf7] overflow-hidden">
          <div className="divide-y divide-nat-border/50">
            {posts.map((post) => (
              <div key={post.id} className="p-6 transition-all hover:bg-black/[0.01]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-nat-sidebar flex items-center justify-center font-bold text-nat-accent uppercase shadow-sm border border-nat-border shrink-0">
                     {(user.role === "admin" || String(user.username).trim() === "Admin") && post.authorName ? post.authorName.charAt(0) : "A"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-bold text-nat-text tracking-tight">
                        {user.role === "admin" || String(user.username).trim() === "Admin" ? (post.authorName || "Community Member") : "Anonymous"}
                      </p>
                      <div className="flex items-center gap-3">
                         <span className="text-[11px] font-semibold text-nat-muted tracking-wide uppercase">
                           {new Date(post.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                         </span>
                         {user.role === "admin" && (
                           <button
                             onClick={() => handleDeletePost(post.id)}
                             className="text-nat-muted hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-50 -mr-1.5"
                             title="Delete message"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         )}
                      </div>
                    </div>
                    <p className="text-nat-text text-[15px] leading-relaxed whitespace-pre-wrap mt-2">
                      {post.content.split(/(#\w+)/g).map((part, i) => 
                        part.startsWith('#') ? (
                          <span key={i} className="text-nat-accent font-medium hover:underline cursor-pointer">{part}</span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {EMOJIS.map(emoji => {
                        const postReactions = post.reactions || {};
                        const count = Object.values(postReactions).filter(e => e === emoji).length;
                        const hasReacted = postReactions[user.uid] === emoji;
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(post.id, post.reactions, emoji)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border ${hasReacted ? 'bg-[#25D366]/10 border-[#25D366]/30 shadow-sm' : 'bg-white border-nat-border hover:bg-nat-sidebar'}`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className={`font-semibold text-xs ${hasReacted ? 'text-green-700' : 'text-nat-muted'}`}>{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-16 text-nat-muted italic p-6">
                Your journal is empty. Write your first entry above.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
