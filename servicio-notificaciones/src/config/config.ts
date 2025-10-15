import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
    rabbitmq: {
        url: string;
        queueName: string;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };
    services: {
        usuarios: string;
        eventos: string;
    };
    jwt: {
        secret: string;
    };
    logging: {
        level: string;
    };
    nodeEnv: string;
}

// Función helper para obtener variables requeridas
function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Variable de entorno ${key} no está definida`);
    }
    return value || defaultValue!;
}

const config: Config = {
    rabbitmq: {
        url: getEnvVar('RABBITMQ_URL'),
        queueName: getEnvVar('QUEUE_NAME'),
    },
    email: {
        host: getEnvVar('SMTP_HOST'),
        port: parseInt(getEnvVar('SMTP_PORT'), 10),
        secure: getEnvVar('SMTP_SECURE') === 'true',
        user: getEnvVar('SMTP_USER'),
        pass: getEnvVar('SMTP_PASS'),
    },
    services: {
        usuarios: getEnvVar('USUARIOS_SERVICE_URL'),
        eventos: getEnvVar('EVENTOS_SERVICE_URL'),
    },
    jwt: {
        // REQUIERE JWT_SECRET 
        secret: getEnvVar('JWT_SECRET'),
    },
    logging: {
        level: getEnvVar('LOG_LEVEL', 'info'),
    },
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
};

export default config;