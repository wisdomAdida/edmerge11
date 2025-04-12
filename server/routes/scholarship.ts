import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertScholarshipSchema } from "@shared/schema";

const router = express.Router();

// Get all scholarships
router.get("/", async (req, res, next) => {
  try {
    const scholarships = await storage.getAllScholarships();
    res.json(scholarships);
  } catch (error) {
    next(error);
  }
});

// Get active scholarships
router.get("/active", async (req, res, next) => {
  try {
    const scholarships = await storage.getActiveScholarships();
    res.json(scholarships);
  } catch (error) {
    next(error);
  }
});

// Get scholarships by level
router.get("/level/:level", async (req, res, next) => {
  try {
    const { level } = req.params;
    const scholarships = await storage.getScholarshipsByLevel(level);
    res.json(scholarships);
  } catch (error) {
    next(error);
  }
});

// Get a specific scholarship
router.get("/:id", async (req, res, next) => {
  try {
    const scholarship = await storage.getScholarship(parseInt(req.params.id));
    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }
    res.json(scholarship);
  } catch (error) {
    next(error);
  }
});

// Create a new scholarship (admin only)
router.post("/", async (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can create scholarships" });
  }

  try {
    const scholarshipData = insertScholarshipSchema.parse({
      ...req.body,
      createdById: req.user.id
    });
    const scholarship = await storage.createScholarship(scholarshipData);
    res.status(201).json(scholarship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid scholarship data", errors: error.format() });
    }
    next(error);
  }
});

// Update a scholarship (admin only)
router.put("/:id", async (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can update scholarships" });
  }

  try {
    const id = parseInt(req.params.id);
    const scholarship = await storage.getScholarship(id);
    
    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }
    
    const updatedScholarship = await storage.updateScholarship(id, req.body);
    res.json(updatedScholarship);
  } catch (error) {
    next(error);
  }
});

// Delete a scholarship (admin only)
router.delete("/:id", async (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can delete scholarships" });
  }

  try {
    const id = parseInt(req.params.id);
    const scholarship = await storage.getScholarship(id);
    
    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }
    
    const success = await storage.deleteScholarship(id);
    if (success) {
      res.status(200).json({ message: "Scholarship deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete scholarship" });
    }
  } catch (error) {
    next(error);
  }
});

export default router;