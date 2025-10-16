# Usar una imagen base oficial de Python 3.12, versión slim para reducir tamaño
FROM python:3.12-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y otras librerías
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt primero para aprovechar el cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código del proyecto
COPY . .

# Exponer el puerto 3002 (definido en config.py)
EXPOSE 3002

# Configurar variables de entorno por defecto (pueden sobreescribirse con .env o docker run)
ENV NODE_ENV=production
ENV PORT=3002
ENV LOG_LEVEL=INFO

# Comando para iniciar el servidor con Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3002", "--workers", "4"]