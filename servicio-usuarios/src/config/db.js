const mongoose = require('mongoose');
const logger = require('./logger'); 

const connectDB = async () => {
    const {
        MONGO_PROTOCOL,
        MONGO_USERNAME,
        MONGO_PASSWORD,
        MONGO_HOST,
        MONGO_PORT,
        MONGO_DATABASE,
        MONGO_AUTH_SOURCE
    } = process.env;

    // Estructura de la URI de MongoDB:
    // protocolo://usuario:contraseña@host:puerto/base_de_datos?opciones
    const MONGO_URI = `${MONGO_PROTOCOL}://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=${MONGO_AUTH_SOURCE}`;

    try {
        await mongoose.connect(MONGO_URI);

        logger.info('Conectado a MongoDB exitosamente');
        console.log('Conectado a MongoDB exitosamente');

    } catch (error) {
        logger.error('Error al conectar a MongoDB:', error);
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;