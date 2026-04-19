import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate request body against Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request body',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

/**
 * Validate route parameters against Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid route parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
