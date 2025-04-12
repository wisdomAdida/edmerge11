import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ArrowRight, CheckCircle, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TutorialStep {
  target: string;
  title: string;
  content: string;
}

interface TutorialSystemProps {
  steps: TutorialStep[];
  storageKey: string;
  defaultShown?: boolean;
}

export default function TutorialSystem({ steps, storageKey, defaultShown = true }: TutorialSystemProps) {
  const [showTutorial, setShowTutorial] = useLocalStorage(storageKey, defaultShown);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setHighlightedElement(null);
  };

  // Find and highlight the target element
  useEffect(() => {
    if (!showTutorial || !steps[currentStep]) return;

    const findElement = () => {
      try {
        const targetSelector = steps[currentStep].target;
        const targetElement = document.querySelector(targetSelector);
  
        if (targetElement) {
          setHighlightedElement(targetElement);
          
          // Scroll target element into view with smooth behavior
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error finding tutorial target element:", error);
        return false;
      }
    };

    // Try to find the element immediately
    const found = findElement();
    
    // If not found, retry a few times with a delay
    if (!found) {
      let attempts = 0;
      const maxAttempts = 5;
      
      const retryInterval = setInterval(() => {
        attempts++;
        if (findElement() || attempts >= maxAttempts) {
          clearInterval(retryInterval);
          
          // If still not found after max attempts, move to next step
          if (!findElement() && attempts >= maxAttempts) {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              completeTutorial();
            }
          }
        }
      }, 500); // Try every 500ms
      
      return () => clearInterval(retryInterval);
    }
  }, [currentStep, showTutorial, steps]);

  // Position the tooltip relative to the highlighted element
  useEffect(() => {
    if (!highlightedElement || !tooltipRef.current) return;

    const positionTooltip = () => {
      try {
        const elementRect = highlightedElement.getBoundingClientRect();
        const tooltipElement = tooltipRef.current;
        
        if (!tooltipElement) return;
  
        // Get tooltip dimensions after it's rendered
        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;
        
        // Account for scroll position for absolute positioning
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        // Window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Default position (centered below the element)
        let top = elementRect.bottom + scrollY + 10;
        let left = elementRect.left + scrollX + (elementRect.width / 2) - (tooltipWidth / 2);
        
        // Adjust if tooltip would go off screen
        if (left + tooltipWidth > windowWidth + scrollX) {
          left = windowWidth + scrollX - tooltipWidth - 10;
        }
        if (left < scrollX) {
          left = scrollX + 10;
        }
        
        // If tooltip would go below window, position it above the element
        if (top + tooltipHeight > windowHeight + scrollY) {
          top = elementRect.top + scrollY - tooltipHeight - 10;
        }
        
        setTooltipPosition({ top, left });
      } catch (error) {
        console.error("Error positioning tutorial tooltip:", error);
        // Set a fallback position in the center of the screen
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 150
        });
      }
    };

    // Initial positioning
    positionTooltip();
    
    // Update position on resize
    window.addEventListener('resize', positionTooltip);
    
    // Update position on scroll
    window.addEventListener('scroll', positionTooltip);
    
    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
    };
  }, [highlightedElement]);

  // Skip tutorial if there's an error or if it's not showing properly
  const handleError = () => {
    console.error("Error in tutorial system, skipping tutorial");
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  try {
    return (
      <>
        {/* Tutorial Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 z-[999]"
          onClick={completeTutorial} // Allow clicking anywhere to close
        />
  
        {/* Highlighted Element Outline */}
        {highlightedElement && (
          <div 
            className="absolute z-[1000] border-2 border-primary rounded-md animate-pulse pointer-events-none"
            style={{
              top: highlightedElement.getBoundingClientRect().top + window.scrollY,
              left: highlightedElement.getBoundingClientRect().left,
              width: highlightedElement.getBoundingClientRect().width,
              height: highlightedElement.getBoundingClientRect().height,
            }}
          />
        )}
  
        {/* Tutorial Tooltip */}
        <div 
          ref={tooltipRef}
          className="fixed z-[1001] w-80 bg-white rounded-lg shadow-lg p-4 border border-border"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {/* Close Button */}
          <button 
            onClick={completeTutorial} 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close tutorial"
          >
            <X size={18} />
          </button>
  
          {/* Step Indicator */}
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <HelpCircle size={16} className="mr-1" />
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>
  
          {/* Title */}
          <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
          
          {/* Content */}
          <p className="text-gray-600 mb-4">{steps[currentStep].content}</p>
  
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="sm"
            >
              Previous
            </Button>
  
            <Button
              onClick={handleNext}
              size="sm"
              className="ml-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Finish <CheckCircle size={16} className="ml-1" />
                </>
              ) : (
                <>
                  Next <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </>
    );
  } catch (error) {
    handleError();
    return null;
  }
}