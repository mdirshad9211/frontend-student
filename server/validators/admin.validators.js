const { z } = require('zod');

const examSchema = z.object({
  name: z.string().min(2).max(120),
  conductingBody: z.string().min(2).max(120),
  minAge: z.number().int().nonnegative(),
  maxAge: z.number().int().nonnegative(),
  educationRequired: z.string().min(2).max(120),
  educationKeys: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
  states: z.array(z.string()).optional().nullable(),
  officialWebsite: z.string().url().optional().nullable(),
});

const examCycleSchema = z.object({
  examId: z.string().min(1),
  applicationStart: z.string().min(1),
  applicationEnd: z.string().min(1),
  examDate: z.string().min(1),
  applyLink: z.string().url().optional().nullable(),
  notificationPdf: z.string().url().optional().nullable(),
});

module.exports = { examSchema, examCycleSchema };

