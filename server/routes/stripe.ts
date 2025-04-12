import express from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';
import { requireAuth } from '../auth';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16'
});

const router = express.Router();

// Create a payment intent for one-time payments
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert to cents
      currency,
      metadata: { userId: req.user?.id.toString() }
    });

    // Return the client secret to the client
    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment intent' });
  }
});

// Create a subscription
router.post('/create-subscription', requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    // Fetch the subscription plan from the database
    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Get or create a customer
    let stripeCustomerId = await storage.getStripeCustomerId(req.user!.id);
    
    if (!stripeCustomerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: req.user!.email,
        name: `${req.user!.firstName} ${req.user!.lastName}`,
        metadata: { userId: req.user!.id.toString() }
      });
      
      stripeCustomerId = customer.id;
      
      // Save the customer ID to the database
      await storage.saveStripeCustomerId(req.user!.id, stripeCustomerId);
    }
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: { 
        userId: req.user!.id.toString(),
        planId: planId.toString(),
        planName: plan.name
      }
    });

    // Return the client secret
    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: error.message || 'Failed to create subscription' });
  }
});

// Complete a payment and activate subscription
router.post('/complete-stripe-payment', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, planId } = req.body;
    
    if (!paymentIntentId || !planId) {
      return res.status(400).json({ message: 'Payment intent ID and plan ID are required' });
    }

    // Retrieve the payment intent to verify it's successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not been completed' });
    }

    // Get the subscription plan
    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Calculate expiration date (3 months from now)
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setMonth(now.getMonth() + 3);

    // Create subscription record
    const subscription = await storage.createSubscription({
      userId: req.user!.id,
      planId,
      startDate: now,
      endDate: expiryDate,
      isActive: true,
      paymentId: paymentIntentId,
      paymentAmount: plan.price,
      paymentProvider: 'stripe',
      createdAt: now
    });

    // Return the subscription details
    res.status(200).json({
      success: true,
      subscription
    });

  } catch (error: any) {
    console.error('Error completing payment:', error);
    res.status(500).json({ message: error.message || 'Failed to complete payment' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Webhook secret is not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      // You can add additional handling here
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
    // ... handle other event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});

export default router;