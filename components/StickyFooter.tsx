import React, { useState, useEffect, useRef } from 'react';

export const StickyFooter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Basic threshold to avoid sensitivity/jitter
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;

      if (currentScrollY > lastScrollY.current) {
        // User is scrolling down -> Show footer
        setIsVisible(true);

        // Reset the auto-hide timer
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false); // Hide after 2 seconds of inactivity
        }, 2000);

      } else {
        // User is scrolling up -> Hide footer immediately
        setIsVisible(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-t-lg border border-slate-800 bg-slate-950/95 px-6 py-3 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <p className="text-sm font-medium">© 2026 FitGenie. Designed and engineered by Haries Hussain.</p>
      </div>
    </div>
  );
};
