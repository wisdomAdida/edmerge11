// API Key should come from environment variables
const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "";

interface PaymentConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    name: string;
    phone_number?: string;
  };
  customer_email?: string; // Optional parameter for Flutterwave
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback_url?: string;
  onClose?: () => void;
  onSuccess?: (data: any) => void;
}

// Define the Flutterwave types
declare global {
  interface Window {
    FlutterwaveCheckout?: (config: PaymentConfig) => void;
  }
}

// A function to load the Flutterwave script dynamically
export const loadFlutterwaveScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Flutterwave script"));
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

// A function to initialize payment using Flutterwave
export const makePayment = async (config: Omit<PaymentConfig, 'public_key'>) => {
  try {
    // Load the Flutterwave script if not loaded
    await loadFlutterwaveScript();
    
    if (!FLUTTERWAVE_PUBLIC_KEY) {
      throw new Error("Flutterwave public key is not available");
    }
    
    // Initialize payment
    const paymentConfig: PaymentConfig = {
      ...config,
      public_key: FLUTTERWAVE_PUBLIC_KEY,
    };
    
    if (window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout(paymentConfig);
    } else {
      throw new Error("Flutterwave is not available");
    }
  } catch (error) {
    console.error("Payment initialization failed:", error);
    throw error;
  }
};

// Simplified interface for Flutterwave payment
export interface FlutterwavePaymentConfig {
  amount: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  payment_options?: string;
  description?: string;
  tx_ref: string;
  callback_url?: string;
  onClose?: () => void;
  onSuccess?: (data: any) => void;
}

// Wrapper function for handling Flutterwave payments with a Promise-based approach
export const handleFlutterwavePayment = (config: FlutterwavePaymentConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      makePayment({
        tx_ref: config.tx_ref,
        amount: config.amount,
        currency: config.currency,
        payment_options: config.payment_options || "card,banktransfer,ussd",
        customer: {
          email: config.customer_email,
          name: config.customer_name,
          phone_number: config.customer_phone,
        },
        customer_email: config.customer_email,
        customizations: {
          title: "EdMerge",
          description: config.description || "EdMerge Payment",
          logo: "https://www.afrimerge.com/logo.png",
        },
        callback_url: config.callback_url,
        onSuccess: (data) => {
          resolve(data);
        },
        onClose: () => {
          if (config.onClose) {
            config.onClose();
          }
          reject(new Error("Payment was cancelled"));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate a unique transaction reference
export const generateTransactionRef = (): string => {
  return `EDMERGE-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

// Function to handle a course purchase
export const purchaseCourse = async (
  courseId: number, 
  amount: number, 
  currency: string, 
  customer: { email: string; name: string; phone_number?: string; customer_email?: string }, 
  onSuccess: (transactionId: string) => void,
  onError: (error: Error) => void
) => {
  try {
    const tx_ref = generateTransactionRef();
    
    await makePayment({
      tx_ref,
      amount,
      currency,
      payment_options: "card,banktransfer,ussd",
      customer,
      customer_email: customer.email || "",
      customizations: {
        title: "EdMerge Course Purchase",
        description: "Payment for premium course",
        logo: "https://www.afrimerge.com/logo.png",
      },
      onSuccess: (data) => {
        if (data.status === "successful") {
          onSuccess(data.transaction_id);
        } else {
          onError(new Error("Payment was not successful"));
        }
      },
      onClose: () => {
        console.log("Payment window closed");
      }
    });
  } catch (error) {
    onError(error as Error);
  }
};

// Function to handle tutor withdrawal
export const initiateWithdrawal = async (
  amount: number,
  bankAccount: {
    account_number: string;
    account_bank: string;
  },
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  try {
    // First stage: Validate the bank account details through Flutterwave
    const validateAccountResponse = await fetch('/api/flutterwave/validate-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankAccount),
      credentials: 'include',
    });
    
    if (!validateAccountResponse.ok) {
      const errorData = await validateAccountResponse.json();
      throw new Error(errorData.message || 'Failed to validate bank account details');
    }
    
    // Bank account validated, now initiate the transfer
    const response = await fetch('/api/flutterwave/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        bankAccount,
        narration: `EdMerge tutor withdrawal - ${new Date().toISOString()}`,
        currency: "NGN", // Default to Nigerian Naira for Flutterwave
        reference: generateTransactionRef()
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Withdrawal request failed');
    }
    
    const data = await response.json();
    
    // Record the withdrawal in our own database
    const recordResponse = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        bankAccount,
        transactionId: data.data?.id || generateTransactionRef(),
        status: "pending"
      }),
      credentials: 'include',
    });
    
    if (!recordResponse.ok) {
      throw new Error('Failed to record withdrawal in system');
    }
    
    onSuccess();
  } catch (error) {
    console.error("Withdrawal error:", error);
    onError(error as Error);
  }
};
