import { useState, useEffect } from 'react';

/**
 * Hook that returns true if the viewport width is less than the specified breakpoint
 * @param breakpoint - The breakpoint in pixels (default: 768px for standard mobile devices)
 * @returns boolean indicating if the viewport is smaller than the breakpoint
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  return isMobile;
}