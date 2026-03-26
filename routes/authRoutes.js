/**
 * routes/authRoutes.js
 * ---------------------
 * Mounts authentication endpoints under /auth
 *
 * POST /auth/login  — validate credentials, return role
 */

const express    = require('express');
const { login }  = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);

module.exports = router;
