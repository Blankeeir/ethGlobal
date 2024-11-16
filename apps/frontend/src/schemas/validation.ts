// apps/frontend/src/schemas/validation.ts
import { z } from 'zod';

export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes'),
  
  email: z.string()
    .email('Invalid email address')
    .optional()
    .nullable(),
  
  settings: z.object({
    notifications: z.boolean(),
    emailUpdates: z.boolean(),
    privacy: z.enum(['public', 'private']),
  }),

  bio: z.string()
    .max(200, 'Bio must be less than 200 characters')
    .optional()
    .nullable(),
});

export const productSchema = z.object({
  name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  quantity: z.number()
    .positive('Quantity must be positive')
    .int('Quantity must be a whole number'),
  
  price: z.number()
    .positive('Price must be positive')
    .multipleOf(0.001, 'Price must have at most 3 decimal places'),
  
  category: z.enum(['fruits', 'vegetables', 'dairy', 'meat', 'grains']),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters'),
  
  expiryDate: z.date()
    .min(new Date(), 'Expiry date must be in the future'),
  
  productionDate: z.date()
    .max(new Date(), 'Production date cannot be in the future'),

  imageUri: z.string()
    .optional()
    .nullable(),

  temperature: z.number(),

  humidity: z.number(),
  
  handler: z.string(), // Added handler field
  carbonFootprint: z.number(), // Added carbonFootprint property
});

export const supplyChainEventSchema = z.object({
  type: z.enum(['production', 'storage', 'transport', 'delivery']),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters'),
  
  temperature: z.number()
    .min(-50, 'Temperature too low')
    .max(100, 'Temperature too high'),
  
  humidity: z.number()
    .min(0, 'Humidity must be between 0 and 100')
    .max(100, 'Humidity must be between 0 and 100'),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

// Type inference helpers
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SupplyChainEventFormData = z.infer<typeof supplyChainEventSchema>;