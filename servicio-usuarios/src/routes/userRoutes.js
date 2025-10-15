const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getMe, getUserById, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// router.use(verifyToken); // Todas protegidas

router.get('/me', verifyToken, getMe);
router.get('/', verifyToken, isAdmin, getAllUsers);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

router.get('/:id', getUserById);

module.exports = router;