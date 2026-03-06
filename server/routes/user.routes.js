const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { validateBody } = require('../middlewares/validate');
const { profileSchema } = require('../validators/user.validators');

const router = express.Router();

router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, validateBody(profileSchema), updateProfile);

module.exports = router;

