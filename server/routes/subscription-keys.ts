import { Router } from "express";
import { storage } from "../storage";
import { nanoid } from "nanoid";
import { z } from "zod";

export const subscriptionKeysRouter = Router();

// Generate unique subscription key
function generateUniqueKey(): string {
  // Format: SK-XXXXXX-XXXXXX-XXXXXX (SK for Subscription Key)
  return `SK-${nanoid(6)}-${nanoid(6)}-${nanoid(6)}`;
}

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}

// Get all subscription keys (admin only)
subscriptionKeysRouter.get("/admin", requireAdmin, async (req, res) => {
  try {
    const keys = await storage.getAllSubscriptionKeys();
    res.json(keys);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific subscription key by ID (admin only)
subscriptionKeysRouter.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const key = await storage.getSubscriptionKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "Subscription key not found" });
    }
    
    res.json(key);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get subscription key by value (used for key verification during login)
subscriptionKeysRouter.get("/verify/:keyValue", async (req, res) => {
  try {
    const keyValue = req.params.keyValue;
    const key = await storage.getSubscriptionKeyByValue(keyValue);
    
    if (!key) {
      return res.status(404).json({ message: "Subscription key not found" });
    }
    
    // Check if key is not active
    if (key.status !== "active") {
      return res.status(400).json({ 
        message: `This subscription key is ${key.status.toLowerCase()}`,
        status: key.status
      });
    }
    
    // Check if key has expired
    if (key.validUntil && new Date(key.validUntil) < new Date()) {
      // Update key status to expired
      await storage.updateSubscriptionKeyStatus(key.id, "expired");
      return res.status(400).json({ 
        message: "This subscription key has expired",
        status: "expired"
      });
    }
    
    res.json({
      keyId: key.id,
      planId: key.planId,
      status: key.status,
      validUntil: key.validUntil
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get subscription key details for a user
subscriptionKeysRouter.get("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = req.user.id;
    const keys = await storage.getSubscriptionKeysByUserId(userId);
    
    res.json(keys);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new subscription key (admin only)
subscriptionKeysRouter.post("/", requireAdmin, async (req, res) => {
  const schema = z.object({
    planId: z.number(),
    description: z.string().optional(),
    validUntil: z.string().optional(),
    userId: z.number().optional(),
  });

  try {
    const validatedData = schema.parse(req.body);
    const adminId = req.user.id;
    
    // Generate unique key value
    const keyValue = generateUniqueKey();
    
    // Create the subscription key
    const key = await storage.createSubscriptionKey({
      planId: validatedData.planId,
      createdById: adminId,
      keyValue,
      status: "active",
      description: validatedData.description || null,
      validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
      userId: validatedData.userId || null,
    });
    
    res.status(201).json(key);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Create multiple subscription keys in batch (admin only)
subscriptionKeysRouter.post("/batch", requireAdmin, async (req, res) => {
  const schema = z.object({
    planId: z.number(),
    count: z.number().min(1).max(100),
    description: z.string().optional(),
    validUntil: z.string().optional(),
  });

  try {
    const validatedData = schema.parse(req.body);
    const adminId = req.user.id;
    
    const keys = [];
    const count = validatedData.count;
    
    // Generate keys in batch
    for (let i = 0; i < count; i++) {
      const keyValue = generateUniqueKey();
      
      const key = await storage.createSubscriptionKey({
        planId: validatedData.planId,
        createdById: adminId,
        keyValue,
        status: "active",
        description: validatedData.description || null,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        userId: null,
      });
      
      keys.push(key);
    }
    
    res.status(201).json(keys);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Redeem a subscription key
subscriptionKeysRouter.post("/redeem", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const schema = z.object({
    keyValue: z.string()
  });

  try {
    const validatedData = schema.parse(req.body);
    const userId = req.user.id;
    
    // Get the key
    const key = await storage.getSubscriptionKeyByValue(validatedData.keyValue);
    
    if (!key) {
      return res.status(404).json({ message: "Subscription key not found" });
    }
    
    // Check if key is not active
    if (key.status !== "active") {
      return res.status(400).json({ 
        message: `This subscription key is ${key.status.toLowerCase()}`,
        status: key.status
      });
    }
    
    // Check if key has expired
    if (key.validUntil && new Date(key.validUntil) < new Date()) {
      // Update key status to expired
      await storage.updateSubscriptionKeyStatus(key.id, "expired");
      return res.status(400).json({ 
        message: "This subscription key has expired",
        status: "expired"
      });
    }
    
    // Redeem the key
    const redeemedKey = await storage.redeemSubscriptionKey(key.id, userId);
    
    // Get subscription plan details
    const plan = await storage.getSubscriptionPlanById(key.planId);
    
    // Set up subscription for the user
    if (plan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      
      await storage.createSubscription({
        userId,
        planId: plan.id,
        status: "active",
        amount: plan.price,
        transactionId: key.keyValue,
        startDate,
        endDate
      });
      
      // Update user subscription type
      const subscriptionType = plan.price <= 5 ? "basic" : "premium";
      await storage.updateUserSubscriptionType(userId, subscriptionType);
    }
    
    res.json({
      success: true,
      message: "Subscription key redeemed successfully",
      key: redeemedKey,
      plan
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Revoke a subscription key (admin only)
subscriptionKeysRouter.post("/:id/revoke", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const key = await storage.getSubscriptionKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "Subscription key not found" });
    }
    
    if (key.status !== "active") {
      return res.status(400).json({ 
        message: `Cannot revoke a key that is already ${key.status.toLowerCase()}`,
      });
    }
    
    // Revoke the key
    const revokedKey = await storage.updateSubscriptionKeyStatus(id, "revoked");
    
    res.json({
      success: true,
      message: "Subscription key revoked successfully",
      key: revokedKey
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Login with subscription key
subscriptionKeysRouter.post("/login", async (req, res) => {
  const schema = z.object({
    keyValue: z.string()
  });

  try {
    const validatedData = schema.parse(req.body);
    
    // Get the key
    const key = await storage.getSubscriptionKeyByValue(validatedData.keyValue);
    
    if (!key) {
      return res.status(404).json({ message: "Subscription key not found" });
    }
    
    // Check if key is neither active nor used
    if (key.status !== "active" && key.status !== "used") {
      return res.status(400).json({ 
        message: `This subscription key is ${key.status.toLowerCase()}`,
        status: key.status
      });
    }
    
    // Check if key has expired
    if (key.validUntil && new Date(key.validUntil) < new Date()) {
      // Update key status to expired
      await storage.updateSubscriptionKeyStatus(key.id, "expired");
      return res.status(400).json({ 
        message: "This subscription key has expired",
        status: "expired"
      });
    }
    
    let user;
    
    // If the key has a user assigned, log in as that user
    if (key.userId) {
      user = await storage.getUser(key.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User associated with this key not found" });
      }
    } else {
      return res.status(400).json({ 
        message: "This subscription key is not associated with any user account. Please redeem it first.",
      });
    }
    
    // Log the user in
    req.login(user, (err: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err.message });
      }
      
      // Add debugging information
      console.log(`User logged in with subscription key. User ID: ${user.id}, Role: ${user.role}`);
      
      res.json({
        success: true,
        message: "Logged in successfully with subscription key",
        user
      });
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});