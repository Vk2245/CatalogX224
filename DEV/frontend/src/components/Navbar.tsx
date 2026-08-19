"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, LogIn, LogOut, LayoutDashboard, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && token.length > 10) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr || "{}");
        setUserName(user.username || user.email || "User");
      } catch {
        setUserName("User");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]); // Re-check on route change

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="bg-white text-black p-1.5 rounded-lg shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <Box size={16} strokeWidth={2.5} />
          </div>
          <span>CatalogX</span>
          <span className="text-[10px] text-[var(--accent-blue)] font-bold uppercase tracking-widest ml-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            AI
          </span>
        </Link>

        {/* Right Nav */}
        {!isAuthPage && (
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-[var(--secondary)] text-sm font-medium px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all"
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 text-[var(--secondary)] text-xs px-3 py-2">
                  <User size={13} />
                  {userName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 btn-ghost text-xs px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 btn-primary text-xs px-4 py-2"
              >
                <LogIn size={14} />
                Sign In
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
