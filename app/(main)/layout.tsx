"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { GraduationCap, Home, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Extracted WhatsApp custom icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.914 6.544l-1.884 5.64 5.86-1.859A11.94 11.94 0 0 0 11.944 24 12 12 0 0 0 24 12 12 12 0 0 0 11.944 0zm0 22.022a9.92 9.92 0 0 1-5.06-1.385l-.36-.214-3.41 1.08.913-3.32-.236-.375a9.96 9.96 0 0 1-1.524-5.289A10.02 10.02 0 0 1 11.944 1.978a10.02 10.02 0 0 1 10.038 10.044 10.02 10.02 0 0 1-10.038 10.0z"/>
      <path d="M17.433 13.918c-.3-.153-1.774-.877-2.05-.977-.275-.1-.476-.153-.676.151-.2.302-.776.977-.95 1.176-.176.202-.352.226-.653.076-.3-.151-1.267-.468-2.414-1.493-.895-.8-1.5-1.787-1.675-2.088-.176-.301-.019-.464.131-.614.135-.136.301-.352.451-.528.151-.176.201-.301.301-.502.1-.201.05-.377-.025-.528-.075-.15-.676-1.63-.926-2.232-.245-.589-.494-.509-.676-.518-.176-.009-.376-.009-.576-.009a1.104 1.104 0 0 0-.796.376c-.276.301-1.053 1.03-1.053 2.512s1.078 2.911 1.228 3.111c.151.201 2.122 3.24 5.138 4.542.718.31 1.278.495 1.716.634.72.228 1.375.195 1.892.118.579-.086 1.774-.725 2.025-1.428.251-.703.251-1.305.176-1.43-.076-.124-.276-.2-.577-.35z"/>
    </svg>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappGroupLink, setWhatsappGroupLink] = useState("https://chat.whatsapp.com/samplelink");

  useEffect(() => {
    import("firebase/firestore").then(({ doc, onSnapshot }) => {
      const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().whatsappLink) {
          setWhatsappGroupLink(docSnap.data().whatsappLink);
        }
      });
      return () => unsub();
    });
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Will redirect or show loading in page.tsx
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navItems = [
    { name: "My Journal", href: "/dashboard", icon: Home },
    { name: "Settings", href: "/profile", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-nat-bg flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-nat-sidebar border-b border-nat-border sticky top-0 z-40">
        <span className="font-serif italic text-xl tracking-tight text-nat-accent font-semibold">10ms-hsc-26</span>
        <div className="flex items-center gap-3">
           <button onClick={handleLogout} className="text-nat-muted hover:text-red-500 ml-1 p-1 transition-colors">
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-[240px] bg-nat-sidebar border-r border-nat-border flex-shrink-0 h-screen sticky top-0">
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-serif italic text-2xl tracking-tight text-nat-accent font-semibold">10ms-hsc-26</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 mb-2 rounded-[12px] text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-nat-accent shadow-nat-card"
                      : "text-nat-muted hover:text-nat-text"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-nat-accent" : "text-nat-muted")} />
                  {item.name === "My Journal" ? "Home" : item.name}
                </Link>
              );
            })}

            {/* Join WhatsApp Button */}
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-[12px] text-sm font-medium text-nat-muted hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp Group
            </button>
          </nav>

          <div className="mt-auto pt-4 border-t border-nat-border">
            <div className="flex items-center gap-3 py-4 mt-2">
               {user.profilePic ? (
                 <img src={user.profilePic} alt="Profile" className="h-10 w-10 min-w-10 rounded-full object-cover shadow-sm bg-white" />
               ) : (
                 <div className="h-10 w-10 min-w-10 rounded-full bg-nat-accent flex items-center justify-center text-white font-bold uppercase">
                   {user.username.charAt(0)}
                 </div>
               )}
               <div className="overflow-hidden text-ellipsis">
                  <p className="text-sm font-semibold text-nat-text truncate">{user.username}</p>
                  <p className="text-xs text-nat-muted uppercase tracking-wider mt-0.5">{user.role}</p>
               </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-nat-muted rounded-xl hover:bg-white hover:shadow-nat-card hover:text-red-500 transition-all mt-2"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-28 md:p-8 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-nat-border z-40 flex justify-around items-center px-2 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors flex-1",
                isActive ? "text-nat-accent" : "text-nat-muted hover:text-nat-text"
              )}
            >
              <div className={cn("p-1.5 rounded-full transition-colors", isActive && "bg-nat-accent/10")}>
                 <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.name === "My Journal" ? "Home" : item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors flex-1 text-nat-muted hover:text-[#25D366]"
        >
          <div className="p-1.5 rounded-full transition-colors">
            <WhatsAppIcon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">WhatsApp</span>
        </button>
      </div>

      {/* WhatsApp Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="absolute top-4 right-4 text-nat-muted hover:bg-nat-sidebar p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#25D366]">
              <WhatsAppIcon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-serif text-nat-text mb-2">Join Community</h2>
            <p className="text-nat-muted text-sm mb-6">Scan the QR code or click the button below to join our official WhatsApp group.</p>
            
            <div className="bg-white p-3 border border-nat-border rounded-2xl shadow-sm inline-block mb-8">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappGroupLink)}`}
                alt="WhatsApp Group QR Code" 
                className="w-48 h-48 block"
              />
            </div>
            
            <a 
              href={whatsappGroupLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#20bd5a] active:scale-95 transition-all shadow-md"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Join via Link
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
