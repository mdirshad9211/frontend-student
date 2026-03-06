const { z } = require('zod');

const createUserExamSchema = z.object({
  examId: z.string().min(1),
  status: z.enum(['interested', 'applied', 'preparing']),
});

module.exports = { createUserExamSchema };

