// server/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Invalid or empty request body" });
    return;
  }

  next();
};
