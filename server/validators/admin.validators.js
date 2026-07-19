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

const pageSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(20000),
}).strict();

const jobSchema = z.object({
  title: z.string().min(2).max(160),
  location: z.string().max(120).optional(),
  employmentType: z.string().max(80).optional(),
  summary: z.string().max(1000).optional(),
  description: z.string().max(10000).optional(),
  applicationUrl: z.string().url().max(2048).optional().or(z.literal('')),
  isPublished: z.boolean().optional(),
}).strict();

const scraperSchema = z.object({ limit: z.number().int().min(1).max(150).optional() }).strict();

module.exports = { examSchema, examCycleSchema, pageSchema, jobSchema, scraperSchema };

