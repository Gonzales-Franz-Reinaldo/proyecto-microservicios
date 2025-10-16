# ===========================
# Stage 1: Build
# ===========================
FROM node:22-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación para producción
RUN npm run build

# ===========================
# Stage 2: Production
# ===========================
FROM nginx:alpine

# Copiar archivos compilados desde el build stage
COPY --from=build /app/dist/sistema-venta-entradas-app/browser /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]