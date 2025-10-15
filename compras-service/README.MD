# 🛒 Servicio de Compras

Microservicio de gestión de compras de entradas construido en **Python** con **FastAPI** para el Sistema de Venta de Entradas.

---

## 🚀 Características

- ✅ Creación y gestión de compras
- ✅ Procesamiento de pagos
- ✅ Integración con RabbitMQ para notificaciones asíncronas
- ✅ Autenticación JWT
- ✅ Validación de disponibilidad de entradas
- ✅ Logging profesional con Winston
- ✅ Base de datos PostgreSQL con SQLAlchemy
- ✅ API RESTful documentada con Swagger/OpenAPI
- ✅ Manejo robusto de errores

---

## 📋 Requisitos Previos

- **Python** >= 3.12
- **PostgreSQL** >= 14
- **RabbitMQ** (Docker recomendado)
- **pip** o **poetry**

---

## ⚙️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Gonzales-Franz-Reinaldo/proyecto-microservicios.git
cd compras-service

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

---

## 🔧 Configuración (.env)

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=db_compras

# JWT (mismo secret que otros servicios)
JWT_SECRET=80c5eb16a4570f9f2922464cb86175954971d6c8c7f5dc948703f808661c7396
JWT_ALGORITHM=HS256

# URLs de microservicios
USUARIOS_SERVICE_URL=http://localhost:3000
EVENTOS_SERVICE_URL=http://localhost:3001

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=notificaciones_compras

# Aplicación
NODE_ENV=development
PORT=3002
LOG_LEVEL=INFO
```

---

## 🗄️ Configuración de Base de Datos

### Crear Base de Datos

```sql
CREATE DATABASE db_compras;

\c db_compras;
```

### Crear Tabla de Compras

```sql
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    usuario_id VARCHAR(255) NOT NULL,
    evento_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    metodo_pago VARCHAR(50),
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_usuario_id ON compras(usuario_id);
CREATE INDEX idx_evento_id ON compras(evento_id);
CREATE INDEX idx_estado ON compras(estado);
CREATE INDEX idx_fecha_compra ON compras(fecha_compra);
```

### Datos de Ejemplo

```sql
INSERT INTO compras (usuario_id, evento_id, cantidad, precio_unitario, total, estado, metodo_pago, fecha_pago) VALUES
('507f1f77bcf86cd799439011', 1, 2, 150.50, 301.00, 'pagado', 'tarjeta', NOW()),
('507f1f77bcf86cd799439012', 2, 1, 120.00, 120.00, 'pagado', 'efectivo', NOW()),
('507f1f77bcf86cd799439011', 3, 4, 80.00, 320.00, 'pendiente', NULL, NULL);
```

---

## 🐰 Configuración de RabbitMQ

### Iniciar RabbitMQ con Docker

```bash
# Descargar e iniciar RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Acceder a la interfaz web: http://localhost:15672
# Usuario: guest | Contraseña: guest
```

---

## 🏃 Ejecución

```bash
# Desarrollo (con hot-reload)
uvicorn app.main:app --reload --port 3002

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 3002 --workers 4
```

El servidor estará disponible en: **http://localhost:3002**

**Documentación interactiva:**
- Swagger UI: http://localhost:3002/docs
- ReDoc: http://localhost:3002/redoc

---

## 📡 Endpoints API

### **Compras**

#### Crear Compra
```http
POST /api/v1/compras
Authorization: Bearer {token}
Content-Type: application/json

{
  "evento_id": 1,
  "cantidad": 2
}
```

**Respuesta:**
```json
{
  "id": 1,
  "usuario_id": "507f1f77bcf86cd799439011",
  "evento_id": 1,
  "cantidad": 2,
  "precio_unitario": 150.50,
  "total": 301.00,
  "estado": "pendiente",
  "metodo_pago": null,
  "fecha_compra": "2025-10-15T12:00:00",
  "fecha_pago": null,
  "created_at": "2025-10-15T12:00:00",
  "updated_at": "2025-10-15T12:00:00"
}
```

#### Listar Compras del Usuario
```http
GET /api/v1/compras/usuario
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "usuario_id": "507f1f77bcf86cd799439011",
    "evento_id": 1,
    "cantidad": 2,
    "precio_unitario": 150.50,
    "total": 301.00,
    "estado": "pagado",
    "metodo_pago": "tarjeta",
    "fecha_compra": "2025-10-15T12:00:00",
    "fecha_pago": "2025-10-15T12:05:00",
    "evento": {
      "id": 1,
      "nombre": "Concierto Rock 2025",
      "fecha": "2025-03-15T20:00:00",
      "lugar": "Estadio Nacional",
      "precio": 150.50
    }
  }
]
```

#### Obtener Compra por ID
```http
GET /api/v1/compras/:id
Authorization: Bearer {token}
```

#### Confirmar Pago
```http
POST /api/v1/compras/:id/pagar
Authorization: Bearer {token}
Content-Type: application/json

{
  "metodo_pago": "tarjeta"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "usuario_id": "507f1f77bcf86cd799439011",
  "evento_id": 1,
  "cantidad": 2,
  "precio_unitario": 150.50,
  "total": 301.00,
  "estado": "pagado",
  "metodo_pago": "tarjeta",
  "fecha_compra": "2025-10-15T12:00:00",
  "fecha_pago": "2025-10-15T12:05:00",
  "created_at": "2025-10-15T12:00:00",
  "updated_at": "2025-10-15T12:05:00"
}
```

**Nota:** Al confirmar el pago, se envía automáticamente un mensaje a RabbitMQ para notificar al servicio de notificaciones.

#### Cancelar Compra
```http
DELETE /api/v1/compras/:id
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Compra cancelada exitosamente"
}
```

---

## 🔐 Autenticación JWT

Todos los endpoints requieren un token JWT válido:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener Token

El token se obtiene desde el **Servicio de Usuarios** (puerto 3000):

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"franz@example.com","password":"password123"}'
```

---

## 🔄 Flujo de Compra

```
1. Usuario crea compra (POST /api/v1/compras)
   ↓
2. Sistema valida disponibilidad de entradas (llama a Servicio de Eventos)
   ↓
3. Se crea la compra en estado "pendiente"
   ↓
4. Usuario confirma pago (POST /api/v1/compras/:id/pagar)
   ↓
5. Sistema actualiza estado a "pagado"
   ↓
6. Se envía mensaje a RabbitMQ
   ↓
7. Servicio de Notificaciones recibe mensaje y envía email
```

---

## 📁 Estructura del Proyecto

```
compras-service/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Punto de entrada FastAPI
│   ├── config/
│   │   ├── __init__.py
│   │   └── config.py              # Configuración centralizada
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py            # Conexión PostgreSQL con databases
│   ├── models/
│   │   ├── __init__.py
│   │   └── compra.py              # Modelos Pydantic
│   ├── routes/
│   │   ├── __init__.py
│   │   └── compras.py             # Rutas de la API
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── compra_schema.py       # Schemas de respuesta
│   ├── services/
│   │   ├── __init__.py
│   │   ├── compras_service.py     # Lógica de negocio
│   │   ├── eventos_client.py      # Cliente HTTP para eventos
│   │   ├── usuarios_client.py     # Cliente HTTP para usuarios
│   │   └── rabbitmq_client.py     # Cliente RabbitMQ
│   └── utils/
│       ├── __init__.py
│       ├── jwt_utils.py           # Verificación JWT
│       └── logger.py              # Logger profesional
├── logs/                           # Logs generados (auto-creado)
├── test/                           # Tests unitarios
├── .env                            # Variables de entorno
├── .env.example                    # Plantilla de variables
├── requirements.txt                # Dependencias Python
├── Dockerfile                      # Para contenedorización
└── README.MD
```

---

## 📦 Dependencias Principales

```txt
fastapi==0.115.6          # Framework web
uvicorn[standard]==0.34.0 # Servidor ASGI
databases[postgresql]==0.9.0  # Async PostgreSQL
asyncpg==0.30.0           # Driver PostgreSQL
aio-pika==9.5.2           # Cliente RabbitMQ async
httpx==0.28.1             # Cliente HTTP async
pyjwt==2.10.1             # Verificación JWT
pydantic==2.10.4          # Validación de datos
pydantic-settings==2.7.0  # Settings management
python-dotenv==1.0.1      # Variables de entorno
```

---

## 🧪 Pruebas con cURL

### 1. Crear Compra
```bash
curl -X POST http://localhost:3002/api/v1/compras \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "evento_id": 1,
    "cantidad": 2
  }'
```

### 2. Listar Compras del Usuario
```bash
curl -X GET http://localhost:3002/api/v1/compras/usuario \
  -H "Authorization: Bearer {token}"
```

### 3. Confirmar Pago
```bash
curl -X POST http://localhost:3002/api/v1/compras/1/pagar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "metodo_pago": "tarjeta"
  }'
```

### 4. Cancelar Compra
```bash
curl -X DELETE http://localhost:3002/api/v1/compras/1 \
  -H "Authorization: Bearer {token}"
```

---

## 📊 Logs

Los logs se generan en el directorio `logs/`:

```
logs/
├── compras-service-2025-10-15.log         # Logs generales
└── compras-service-errors-2025-10-15.log  # Solo errores
```

**Formato de logs:**
```
[2025-10-15 12:00:00] INFO  [compras-service]: Compra creada | CompraID: 1 | Usuario: 507f1f77bcf86cd799439011 | Evento: 1 | Cantidad: 2 (45.23ms)
[2025-10-15 12:05:00] INFO  [compras-service]: Pago confirmado | CompraID: 1 | Método: tarjeta | Total: $301.00 (78.45ms)
[2025-10-15 12:05:01] INFO  [compras-service]: Mensaje enviado a RabbitMQ | CompraID: 1 | Cola: notificaciones_compras
```

---

## 🐛 Solución de Problemas

### Error: "Could not connect to PostgreSQL"
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Verificar credenciales en .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=db_compras
```

### Error: "Connection refused [Errno 111]" (RabbitMQ)
```bash
# Verificar que RabbitMQ esté corriendo
docker ps | grep rabbitmq

# Iniciar RabbitMQ
docker start rabbitmq

# O crear nuevo contenedor
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Error: "JWT token is invalid"
- Verifica que `JWT_SECRET` sea el mismo en todos los microservicios
- Asegúrate de incluir `Bearer` antes del token
- Verifica que el token no haya expirado

### Error: "Event not found" o "User not found"
- Verifica que los otros microservicios estén corriendo:
  - Servicio de Usuarios: http://localhost:3000
  - Servicio de Eventos: http://localhost:3001

---

## 🔗 Integración con Otros Microservicios

Este servicio se integra con:

### Servicio de Usuarios (puerto 3000)
- Validación de tokens JWT
- Obtención de datos de usuario

### Servicio de Eventos (puerto 3001)
- Validación de disponibilidad de entradas
- Obtención de datos del evento
- Actualización de entradas disponibles

### Servicio de Notificaciones (RabbitMQ)
- Envío de mensajes al confirmar pagos
- Notificaciones por email a usuarios

---

## 🐳 Docker

### Construir Imagen

```bash
docker build -t compras-service:latest .
```

### Ejecutar Contenedor

```bash
docker run -d \
  --name compras-service \
  -p 3002:3002 \
  --env-file .env \
  compras-service:latest
```

### Docker Compose (Recomendado)

```yaml
version: '3.8'

services:
  compras-service:
    build: .
    ports:
      - "3002:3002"
    environment:
      - DB_HOST=postgres
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - postgres
      - rabbitmq
    networks:
      - microservices-network

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: db_compras
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - microservices-network

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - microservices-network

networks:
  microservices-network:
    driver: bridge

volumes:
  postgres-data:
```

---

## 📝 Scripts Útiles

```bash
# Desarrollo
uvicorn app.main:app --reload --port 3002

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 3002 --workers 4

# Linter
flake8 app/

# Formatear código
black app/

# Type checking
mypy app/

# Tests
pytest test/

# Cobertura de tests
pytest --cov=app test/
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

ISC © 2025 Franz Gonzales

---

## 👨‍💻 Autor

**Franz Gonzales Reinaldo**
- GitHub: [@Gonzales-Franz-Reinaldo](https://github.com/Gonzales-Franz-Reinaldo)

---

## 🆘 Soporte

Si tienes problemas o preguntas:
- Abre un issue en GitHub
- Contacta: gonzalesfranz2019@gmail.com

---

**⭐ Si te fue útil, dale una estrella al repositorio!**

---

## 📚 Recursos Adicionales

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Databases Documentation](https://www.encode.io/databases/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)