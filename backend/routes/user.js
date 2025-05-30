const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const validateUser = require('../middleware/validateUser');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite à 5 tentatives
    message: 'Trop de tentatives, réessayez plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/signup', validateUser, userCtrl.signup);
router.post('/login', loginLimiter, userCtrl.login);

module.exports = router;