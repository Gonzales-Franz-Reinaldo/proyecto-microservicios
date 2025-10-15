const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Middleware para manejar errores de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Errores de validación', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validador para register
const validateRegister = [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña mínima 6 caracteres'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Rol inválido'),
    validate
];

// Validador para login
const validateLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    validate
];

module.exports = { validateRegister, validateLogin, validate };