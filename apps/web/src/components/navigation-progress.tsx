"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), 0);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function startLoading() {
      setIsLoading(true);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => setIsLoading(false), 12000);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      startLoading();
    }

    function handleSubmit() {
      startLoading();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70]">
      <div className="h-1 w-full overflow-hidden bg-primary-soft">
        <div className="h-full w-1/2 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-r-full bg-primary" />
      </div>
      <div className="mx-auto mt-3 flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
        <span className="rounded-full border border-emerald-100 bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          Loading...
        </span>
      </div>
    </div>
  );
}
