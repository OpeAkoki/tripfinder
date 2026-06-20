// input validation schemas using Zod
const { z } = require('zod');

const createBookingSchema = z.object({
  packageId: z.number().int().positive(),
  travellers: z.number().int().min(1).max(20),
  bookingDate: z.string().date()
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.enum(['member', 'guest'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

module.exports = { createBookingSchema, registerSchema, loginSchema };
