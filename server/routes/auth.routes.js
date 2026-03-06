const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validators');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);

module.exports = router;

