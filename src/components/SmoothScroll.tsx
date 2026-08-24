"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Helper component to manage scroll restoration and layout-aware page transitions
function RouteScrollManager() {
  const pathname = usePathname();
  const lenis = useLenis();
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!lenis || typeof window === "undefined") return;

    // Clean up any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (pathname !== "/") {
      // On non-home pages, always start cleanly at the top
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    // When returning to Home ("/")
    const targetId = sessionStorage.getItem("scroll_restore_target") || sessionStorage.getItem("scroll-target");
    const hash = window.location.hash ? window.location.hash.replace("#", "") : null;
    const finalTarget = targetId || hash;

    if (finalTarget) {
      sessionStorage.removeItem("scroll_restore_target");
      sessionStorage.removeItem("scroll-target");
      sessionStorage.removeItem("scroll_restore_pos");

      const alignToTarget = () => {
        const el = document.getElementById(finalTarget);
        if (el) {
          lenis.resize();
          lenis.scrollTo(el, { offset: -40, immediate: true });
        }
      };

      // Perform initial alignment
      alignToTarget();

      // Monitor layout shifts as dynamic cards, images, and fonts finish rendering
      const observer = new ResizeObserver(() => {
        alignToTarget();
      });
      observer.observe(document.body);
      observerRef.current = observer;

      // Disconnect after layout has stabilized (1.8s)
      const timeout = setTimeout(() => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        window.history.replaceState(null, "", "/");
      }, 1800);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        clearTimeout(timeout);
      };
    } else {
      const savedPos = sessionStorage.getItem("scroll_restore_pos");
      if (savedPos) {
        sessionStorage.removeItem("scroll_restore_pos");
        const pos = parseFloat(savedPos);
        if (!isNaN(pos)) {
          lenis.scrollTo(pos, { immediate: true });
        }
      }
    }
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Disable smooth scroll on admin dashboard for better usability
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root className="flex flex-col min-h-screen w-full" options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <RouteScrollManager />
      {children}
    </ReactLenis>
  );
}
