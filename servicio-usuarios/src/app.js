const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./config/logger');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Crear app
const app = express();

// Middlewares de seguridad y logging
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: logger.stream })); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.json({ message: 'Servicio de Usuarios v1.0 - API REST con JWT' });
});

// Middleware global de errores
app.use((err, req, res, next) => {
    logger.error(err.message, { stack: err.stack, url: req.url });
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

module.exports = app;