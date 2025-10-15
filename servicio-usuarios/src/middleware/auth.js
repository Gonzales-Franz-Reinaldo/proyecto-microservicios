const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
        logger.warn('No token proporcionado');
        return res.status(401).json({ message: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo.' });
        }
        req.user = user;
        next();
    } catch (err) {
        logger.error('Error al verificar token:', err);
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para admin only
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: Requiere rol admin.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };