const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs'); 

// Register 
const register = async (req, res) => {
    try {
        logger.info('Iniciando registro de usuario', { email: req.body.email });
        const { name, email, password, role = 'user' } = req.body;

        // Verificar si existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Usuario ya existe' });
        }

        // Crear usuario (hash auto en pre-save)
        const user = new User({ name, email, password, role });
        await user.save();

        logger.info('Usuario registrado exitosamente', { userId: user._id });
        res.status(201).json({ message: 'Usuario creado', user: { id: user._id, name, email, role } });
    } catch (error) {
        logger.error('Error en registro:', error.message);
        res.status(500).json({ message: 'Error interno al registrar' });
    }
};

// Login 
const login = async (req, res) => {
    try {
        logger.info('Iniciando login', { email: req.body.email });
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.isActive || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.info('Login exitoso', { userId: user._id });
        res.status(200).json({ message: 'Login exitoso', user: { id: user._id, name: user.name, email, role: user.role }, token });
    } catch (error) {
        logger.error('Error en login:', error.message);
        res.status(500).json({ message: 'Error interno al login' });
    }
};

// Get current user (protegido)
const getMe = async (req, res) => {
    try {
        logger.info('Obteniendo perfil del usuario', { userId: req.user._id });
        res.status(200).json(req.user);
    } catch (error) {
        logger.error('Error al obtener perfil:', error.message);
        res.status(500).json({ message: 'Error interno' });
    }
};

// Obtener usuario por ID 
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info('Obteniendo usuario por ID (microservicio)', { userId: id });

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            logger.warn('Usuario no encontrado', { userId: id });
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!user.isActive) {
            logger.warn('Usuario inactivo', { userId: id });
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        logger.info('Usuario encontrado', { userId: id, email: user.email });
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error al obtener usuario por ID:', error.message);
        res.status(500).json({ message: 'Error interno' });
    }
};


// List all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        logger.info('Listando todos los usuarios');
        const users = await User.find({ isActive: true }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error al listar usuarios:', error.message);
        res.status(500).json({ message: 'Error interno' });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info('Actualizando usuario', { userId: id });

        if (req.user._id.toString() !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para actualizar este usuario' });
        }

        const updates = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 12);
        }

        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        logger.info('Usuario actualizado', { userId: id });
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error al actualizar usuario:', error.message);
        res.status(500).json({ message: 'Error interno' });
    }
};

// Delete user 
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info('Eliminando usuario (soft)', { userId: id });

        if (req.user._id.toString() !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para eliminar este usuario' });
        }

        const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        logger.info('Usuario eliminado (soft)', { userId: id });
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        logger.error('Error al eliminar usuario:', error.message);
        res.status(500).json({ message: 'Error interno' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
};