"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { localDb } from "@/lib/store";
import { GraduationCap, Home, Users, ShieldAlert, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Will redirect or show loading in page.tsx
  }

  const handleLogout = async () => {
    localDb.logout();
    router.push("/");
  };

  const navItems = [
    { name: "My Journal", href: "/dashboard", icon: Home },
    { name: "Settings", href: "/profile", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-nat-bg flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[240px] bg-nat-sidebar border-b md:border-b-0 md:border-r border-nat-border flex-shrink-0">
        <div className="h-full flex flex-col p-4 md:p-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-serif italic text-2xl tracking-tight text-nat-accent font-semibold">My Space</span>
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
                  {item.name}
                </Link>
              );
            })}
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
                  <p className="text-sm font-semibold text-nat-text truncate">User Workspace</p>
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
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
