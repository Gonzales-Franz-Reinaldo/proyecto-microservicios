const express = require('express');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { register, login } = require('../controllers/userController');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

module.exports = router;