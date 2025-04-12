import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useGeoLocation } from '@/hooks/use-location';
import { convertUSDtoNGN, formatCurrency } from '@/lib/utils';
import { useCvPayment } from '@/hooks/use-cv-payment';

interface CvPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Modal for CV Generator one-time payment
 * Allows users to pay a fixed fee ($1 or ₦1,500) to generate a CV without a subscription
 */
export default function CvPaymentModal({ isOpen, onOpenChange, onSuccess }: CvPaymentModalProps) {
  const { currencyCode } = useGeoLocation();
  const { initiateCvPayment, loading: isProcessing } = useCvPayment();

  // Fee is $1 USD or equivalent in local currency
  const feeUSD = 1;
  const feeNGN = convertUSDtoNGN(feeUSD);
  
  // Get fee in user's currency
  const getFee = () => {
    return currencyCode === 'USD' ? feeUSD : feeNGN;
  };
  
  // Format fee for display
  const formattedFee = formatCurrency(getFee(), currencyCode);

  const handlePayment = async () => {
    const result = await initiateCvPayment(getFee(), currencyCode);
    
    if (result?.status === "successful") {
      // Handle successful payment
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>CV Generation Fee</DialogTitle>
          <DialogDescription>
            Generate professional CVs for a small one-time fee
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">One-time CV Generation</h3>
                  <p className="text-sm text-muted-foreground">Unlimited access for 24 hours</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formattedFee}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Access to all premium CV templates</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Create up to 10 CVs in 24 hours</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Access to AI content enhancement</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Download and save your CVs</span>
                </div>
              </div>
            </Card>
            
            <div className="text-sm text-muted-foreground">
              <p>
                This one-time fee allows you to create up to 10 professional CVs within a 24-hour period.
                For unlimited CV generation, consider upgrading to a subscription.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pay {formattedFee}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}