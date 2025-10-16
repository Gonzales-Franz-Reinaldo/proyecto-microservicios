FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src ./src

# Exponer puerto
EXPOSE 3000

# Iniciar aplicación
CMD ["node", "src/server.js"]