import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(150),
  procedure: z.enum(['rhinoplasty', 'facelift', 'other']),
  timing: z.enum(['within_3_months', '3_to_6_months', 'later', 'not_sure']),
  country_city: z.string().trim().min(1).max(150),
  matters_most: z.enum(['experience', 'price', 'language', 'recovery']),
  would_pay: z.enum(['yes', 'maybe', 'no']),
  comment: z.string().trim().max(2000),
  consent: z.literal(true),
  language: z.enum(['ru', 'en']),
});
export type Language = 'ru' | 'en';
export type LeadInput = z.infer<typeof leadSchema>;
