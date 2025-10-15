# 👤 Servicio de Usuarios

Microservicio de autenticación y gestión de usuarios con JWT y MongoDB.

---

## 🚀 Características

- ✅ Registro y autenticación de usuarios
- ✅ Tokens JWT con expiración configurable
- ✅ Roles de usuario (admin/user)
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Middleware de autenticación y autorización
- ✅ Logging profesional con Winston
- ✅ Validación de datos con express-validator
- ✅ Conexión a MongoDB con Mongoose

---

## 📋 Requisitos Previos

- **Node.js** >= 16
- **MongoDB** (local o cloud)
- **npm** o **yarn**

---

## ⚙️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Gonzales-Franz-Reinaldo/proyecto-microservicios.git
cd servicio-usuarios

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

---

## 🔧 Configuración (.env)

```env
# MongoDB
DB_URI=mongodb://localhost:27017/db_usuarios

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# Servidor
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

---

## 🏃 Ejecución

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📡 Endpoints API

### **Autenticación**

#### Registro de Usuario
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Franz Gonzales",
  "email": "franz@example.com",
  "password": "password123",
  "role": "user"  // opcional: "user" (default) o "admin"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Franz Gonzales",
    "email": "franz@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "franz@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Franz Gonzales",
    "email": "franz@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Gestión de Usuarios**

#### Obtener Perfil Actual
```http
GET /api/v1/users/me
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Franz Gonzales",
  "email": "franz@example.com",
  "role": "user",
  "createdAt": "2025-10-15T00:00:00.000Z"
}
```

#### Obtener Usuario por ID
```http
GET /api/v1/users/:id
Authorization: Bearer {token}
```

#### Listar Todos los Usuarios (Solo Admin)
```http
GET /api/v1/users
Authorization: Bearer {admin_token}
```

**Respuesta:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Franz Gonzales",
    "email": "franz@example.com",
    "role": "user",
    "createdAt": "2025-10-15T00:00:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-10-14T00:00:00.000Z"
  }
]
```

#### Actualizar Usuario
```http
PUT /api/v1/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Franz R. Gonzales",
  "email": "franz.updated@example.com"
}
```

#### Eliminar Usuario (Solo Admin)
```http
DELETE /api/v1/users/:id
Authorization: Bearer {admin_token}
```

---

## 🔐 Autenticación JWT

Todos los endpoints protegidos requieren un token JWT en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "user",
  "iat": 1634567890,
  "exp": 1635172690
}
```

---

## 👥 Roles y Permisos

| Rol     | Permisos                                                    |
|---------|-------------------------------------------------------------|
| `user`  | Ver su propio perfil, actualizar sus datos                 |
| `admin` | Gestión completa de usuarios, acceso a todos los endpoints |

---

## 📁 Estructura del Proyecto

```
servicio-usuarios/
├── src/
│   ├── app.js                 # Configuración de Express
│   ├── server.js              # Punto de entrada
│   ├── config/
│   │   ├── db.js              # Conexión MongoDB
│   │   └── logger.js          # Logger Winston
│   ├── controllers/
│   │   └── userController.js  # Lógica de negocio
│   ├── middleware/
│   │   ├── auth.js            # Verificación JWT
│   │   └── validation.js      # Validación de datos
│   ├── models/
│   │   └── User.js            # Modelo Mongoose
│   └── routes/
│       ├── authRoutes.js      # Rutas de autenticación
│       └── userRoutes.js      # Rutas de usuarios
├── logs/                       # Archivos de logs (auto-generado)
├── .env                        # Variables de entorno
├── .env.example                # Plantilla de variables
├── package.json
└── README.md
```

---

## 🧪 Pruebas con Postman

### Importar Colección

Crea una colección con las siguientes variables:

- `base_url`: `http://localhost:3000`
- `token`: (se actualizará automáticamente después del login)

### Flujo de Prueba

1. **Registrar usuario**:
   ```
   POST {{base_url}}/api/v1/auth/register
   ```

2. **Login** (copiar el token de la respuesta):
   ```
   POST {{base_url}}/api/v1/auth/login
   ```

3. **Ver perfil** (usar token en Authorization):
   ```
   GET {{base_url}}/api/v1/users/me
   ```

4. **Listar usuarios** (requiere token de admin):
   ```
   GET {{base_url}}/api/v1/users
   ```

---

## 📊 Logs

Los logs se generan automáticamente en el directorio `logs/`:

```
logs/
├── usuarios-service-2025-10-15.log       # Logs generales
└── usuarios-service-errors-2025-10-15.log # Solo errores
```

**Formato de logs:**
```
[2025-10-15 01:30:00] INFO  [usuarios-service]: Usuario registrado | ID: 507f1f77bcf86cd799439011 | Email: franz@example.com
[2025-10-15 01:30:05] INFO  [usuarios-service]: Login exitoso | Usuario: franz@example.com | IP: 127.0.0.1
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# O iniciar MongoDB
sudo systemctl start mongod
```

### Error: "jwt malformed"
- Verifica que el token esté en el formato: `Bearer {token}`
- Asegúrate de que `JWT_SECRET` sea el mismo en `.env`

### Error: "Port 3000 already in use"
```bash
# Cambiar el puerto en .env
PORT=3001
```

---

## 🔗 Integración con Otros Microservicios

Este servicio se integra con:

- **Servicio de Eventos** (puerto 3001): Autenticación de usuarios para consultar eventos
- **Servicio de Compras** (puerto 3002): Verificación de usuarios al realizar compras
- **Servicio de Notificaciones**: Obtención de datos de usuario para envío de emails

---

## 📝 Scripts Disponibles

```bash
npm run dev        # Desarrollo con nodemon
npm start          # Producción
npm test           # Ejecutar pruebas (por implementar)
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