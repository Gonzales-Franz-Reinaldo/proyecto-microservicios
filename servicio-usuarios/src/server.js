require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const connectDB = require('./config/db');

// Conecta a DB 
connectDB();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    logger.info(`Servidor de Usuarios escuchando en puerto ${port}`);
    console.log(`Servidor de Usuarios escuchando en puerto ${port}`);
    console.log(`El Servidor está iniciando en http://localhost:${port}`);
});

module.exports = server;