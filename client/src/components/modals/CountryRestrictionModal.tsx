import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ExternalLink, Info } from "lucide-react";
import { useGeoLocation } from "@/hooks/use-location";
import { useEffect, useState } from "react";

/**
 * Modal displayed when a user from an unsupported country attempts to access the platform
 */
export function CountryRestrictionModal() {
  const { isLoading, isSupported, countryCode } = useGeoLocation();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show the modal if the location has been detected and is not supported
    if (!isLoading && !isSupported) {
      setShowModal(true);
    }
  }, [isLoading, isSupported]);

  const getCountryName = (code: string) => {
    const countryNames: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France'
    };
    
    return countryNames[code] || code;
  };

  if (!showModal) {
    return null;
  }

  return (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <Info className="h-6 w-6" />
            <AlertDialogTitle>Country Restriction Notice</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p>
              We detected that you're accessing EdMerge from {getCountryName(countryCode)}, which is currently not supported.
            </p>
            <p>
              At this time, EdMerge is only available in Nigeria as we're focusing on growing our platform in Africa.
            </p>
            <p>
              We plan to expand to more countries soon. Thank you for your interest in our platform!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogAction 
            className="flex items-center justify-center gap-2"
            onClick={() => window.location.href = "https://www.afrimerge.com"}
          >
            <ExternalLink className="h-4 w-4" />
            Visit Afrimerge Website
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}