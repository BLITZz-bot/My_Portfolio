"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

// Helper component to reset scroll to top on page navigation
function RouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      if (typeof window !== "undefined") {
        if (window.location.hash || sessionStorage.getItem("scroll-target")) {
          return;
        }
      }
      lenis.scrollTo(0, { immediate: true });
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
      <RouteScrollReset />
      {children}
    </ReactLenis>
  );
}
