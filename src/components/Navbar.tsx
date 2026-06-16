"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { checkIsAdmin } from "@/app/actions/admin";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/#projects" },
  { name: "Initiatives", href: "/#ongoing-projects" },
  { name: "Recommendations", href: "/#recommendations" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(() => {
    if (typeof document !== "undefined") {
      return document.body.classList.contains("projects-modal-open");
    }
    return false;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);

  const avatarUrl = 
    session?.user?.user_metadata?.avatar_url || 
    session?.user?.user_metadata?.picture || 
    session?.user?.identities?.[0]?.identity_data?.avatar_url;

  // Observe if the projects modal is open to hide/show the navbar
  useEffect(() => {
    if (typeof document === "undefined") return;

    const observer = new MutationObserver(() => {
      setHideNavbar(document.body.classList.contains("projects-modal-open"));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Clear hash from URL bar when scrolled to the very top
      if (window.scrollY === 0 && window.location.hash) {
        window.history.pushState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("scroll", handleScroll);
    
    if (supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        if (session) {
          const authorized = await checkIsAdmin(session.access_token);
          setIsAdmin(authorized);
        } else {
          setIsAdmin(false);
        }
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session) {
          const authorized = await checkIsAdmin(session.access_token);
          setIsAdmin(authorized);
        } else {
          setIsAdmin(false);
        }
      });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        subscription.unsubscribe();
      };
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  // Close mobile menu on pathname change
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      setTimeout(() => setMobileMenuOpen(false), 0);
    }
    
    // Smooth scroll navigation target restoration after page navigation
    if (pathname === "/" && typeof window !== "undefined") {
      const target = sessionStorage.getItem("scroll-target");
      if (target) {
        sessionStorage.removeItem("scroll-target");
        const element = document.getElementById(target);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
            window.history.replaceState(null, "", "/");
          }, 150);
        }
      }
    }
  }, [pathname, mobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setIsDropdownOpen(false);
  };

  const handleSignIn = () => {
    supabase?.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin } 
    });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/") {
      // If we are on a subpage, handle smooth navigation to target sections cleanly without hash in URL
      e.preventDefault();
      setMobileMenuOpen(false);
      if (href.startsWith("/#") && typeof window !== "undefined") {
        const target = href.substring(2); // e.g. "projects"
        sessionStorage.setItem("scroll-target", target);
      }
      router.push("/");
    } else if (href === "/") {
      // If we are already on home and click "Home", scroll to top
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
      setMobileMenuOpen(false);
    } else if (href.startsWith("/#")) {
      // If we are already on home, let smooth scroll handle it
      e.preventDefault();
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  // Don't show Navbar on admin pages
  // Moved after all hooks to comply with Rules of Hooks
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        hideNavbar ? "-translate-y-full pointer-events-none" : "translate-y-0",
        isScrolled
          ? "bg-neutral-950/80 backdrop-blur-md border-white/5 py-3 shadow-2xl"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          href="/" 
          onClick={(e) => handleNavClick(e, "/")}
          className={cn(
            "text-xl font-bold tracking-tighter transition-colors duration-500",
            isScrolled ? "text-white" : "text-black"
          )}
        >
          M M <span className="text-neutral-500">BHARATH</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
          
          <div className="h-4 w-[1px] bg-white/10 mx-2" />

          {/* Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => session ? setIsDropdownOpen(!isDropdownOpen) : handleSignIn()}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-neutral-900 overflow-hidden hover:border-white/30 transition-all group"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-neutral-500 group-hover:text-white transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {isDropdownOpen && session && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-56 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Logged in as</p>
                    <p className="text-sm font-bold text-white truncate mt-0.5">{session.user.user_metadata.full_name || session.user.email}</p>
                  </div>
                  
                  {isAdmin && (
                    <Link 
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium"
                    >
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <div className="h-[1px] bg-white/5 my-2" />
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-neutral-950 border-b border-white/5 p-6 flex flex-col gap-4 md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-neutral-400 hover:text-white"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="h-[1px] bg-white/5 my-2" />
            
            {session ? (
              <>
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-neutral-900 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-neutral-500" /></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{session.user.user_metadata.full_name || "User"}</p>
                    <p className="text-xs text-neutral-500 truncate max-w-[200px]">{session.user.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Link 
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 text-neutral-300 font-medium"
                  >
                    <LayoutDashboard size={20} />
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 py-3 text-red-500 font-medium"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3"
              >
                Sign in with Google
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
