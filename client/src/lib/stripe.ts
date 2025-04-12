import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('Missing Stripe public key. Make sure VITE_STRIPE_PUBLIC_KEY is set in your environment.');
}

// Load the Stripe instance once
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// Helper function to create a payment intent
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Helper function to create a subscription
export async function createSubscription(planId: number) {
  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Function for completing a payment after successful confirmation
export async function completePayment(paymentIntentId: string, planId: number) {
  try {
    const response = await fetch('/api/complete-stripe-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId, planId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing payment:', error);
    throw error;
  }
}