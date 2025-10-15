# 📧 Servicio de Notificaciones

Microservicio desacoplado que escucha mensajes de RabbitMQ y envía notificaciones por email cuando se confirma el pago de una compra.

---

## 🚀 Características

- ✅ Procesamiento asíncrono de notificaciones vía RabbitMQ
- ✅ Envío de emails HTML profesionales con Nodemailer
- ✅ Integración con servicios de Usuarios y Eventos
- ✅ Logging estructurado con Winston y rotación de archivos
- ✅ Manejo robusto de errores y reintentos automáticos
- ✅ Desacoplamiento total de otros microservicios
- ✅ TypeScript para tipado estático
- ✅ Hot-reload en desarrollo con ts-node-dev

---

## 🏗️ Arquitectura

```
┌─────────────────┐
│ Servicio de     │
│ Compras         │
│ (Python)        │
└────────┬────────┘
         │
         │ Publica mensaje
         ↓
┌─────────────────┐
│   RabbitMQ      │
│   (Cola)        │
└────────┬────────┘
         │
         │ Consume mensaje
         ↓
┌─────────────────┐      HTTP GET      ┌─────────────────┐
│ Servicio de     │ ←─────────────────→ │ Servicio de     │
│ Notificaciones  │                     │ Usuarios (Node) │
│ (TypeScript)    │                     └─────────────────┘
└────────┬────────┘
         │                              ┌─────────────────┐
         │ HTTP GET                     │ Servicio de     │
         └─────────────────────────────→│ Eventos (Rust)  │
         │                              └─────────────────┘
         │
         │ Envía email
         ↓
┌─────────────────┐
│   Gmail SMTP    │
│   (Email)       │
└─────────────────┘
```

**Tecnologías:**
- **RabbitMQ**: Cola de mensajes para comunicación asíncrona
- **Nodemailer**: Envío de emails vía SMTP
- **TypeScript**: Tipado estático y mejor mantenibilidad
- **Axios**: Cliente HTTP para obtener datos de otros servicios
- **Winston**: Logging profesional con rotación de archivos

---

## 📋 Requisitos Previos

- **Node.js** >= 16
- **RabbitMQ** (Docker recomendado)
- **Cuenta de Gmail** con contraseña de aplicación

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Gonzales-Franz-Reinaldo/proyecto-microservicios.git
cd servicio-notificaciones

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

---

## ⚙️ Configuración (.env)

```env
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
QUEUE_NAME=notificaciones_compras

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación_aqui

# URLs de microservicios
USUARIOS_SERVICE_URL=http://localhost:3000
EVENTOS_SERVICE_URL=http://localhost:3001

# JWT (mismo secret que otros servicios)
JWT_SECRET=80c5eb16a4570f9f2922464cb86175954971d6c8c7f5dc948703f808661c7396

# Aplicación
NODE_ENV=development
LOG_LEVEL=info
```

---

## 🔐 Generar Contraseña de Aplicación de Gmail

### Opción 1: Con Verificación en 2 Pasos (Recomendado)

1. **Activa la verificación en 2 pasos**:
   - Ve a: https://myaccount.google.com/security
   - Busca "Verificación en dos pasos" y actívala

2. **Genera una contraseña de aplicación**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe: "Servicio Notificaciones"
   - Click en "Generar"
   - **Copia la contraseña de 16 caracteres** (sin espacios)

3. **Actualiza tu `.env`**:
   ```env
   SMTP_PASS=abcd efgh ijkl mnop  # (pegar sin espacios: abcdefghijklmnop)
   ```

### Opción 2: Usar Ethereal (Emails de Prueba)

Para desarrollo sin configurar Gmail real:

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ethereal
SMTP_PASS=ethereal
```

Los emails se verán en una URL de preview en lugar de enviarse realmente.

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

### Verificar que la cola existe

Accede a http://localhost:15672 y ve a la pestaña "Queues". Deberías ver la cola `notificaciones_compras`.

---

## 🏃 Ejecución

```bash
# Desarrollo (con hot-reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start
```

El servicio iniciará y se conectará automáticamente a RabbitMQ para escuchar mensajes.

**Logs esperados:**
```
[2025-10-15 12:00:00] info: ============================================================
[2025-10-15 12:00:00] info: [notificaciones-service]: Iniciando Servicio de Notificaciones
[2025-10-15 12:00:00] info: [notificaciones-service]: Ambiente: development
[2025-10-15 12:00:00] info: [notificaciones-service]: Nivel de logs: info
[2025-10-15 12:00:00] info: ============================================================
[2025-10-15 12:00:01] info: [notificaciones-service]: Conexión SMTP verificada exitosamente (234ms)
[2025-10-15 12:00:02] info: [notificaciones-service]: Conectado a RabbitMQ exitosamente (156ms)
[2025-10-15 12:00:02] info: [notificaciones-service]: Escuchando mensajes en cola: notificaciones_compras
```

---

## 📨 Formato del Mensaje (RabbitMQ)

El servicio espera mensajes en el siguiente formato JSON:

```json
{
  "compraId": 1,
  "usuarioId": "507f1f77bcf86cd799439011",
  "eventoId": 1,
  "cantidad": 2,
  "total": 301.00,
  "metodoPago": "tarjeta",
  "fechaPago": "2025-10-15T12:05:00Z"
}
```

### Campos Requeridos:

| Campo        | Tipo     | Descripción                          |
|--------------|----------|--------------------------------------|
| `compraId`   | `number` | ID de la compra                      |
| `usuarioId`  | `string` | ID del usuario (MongoDB ObjectId)    |
| `eventoId`   | `number` | ID del evento                        |
| `cantidad`   | `number` | Cantidad de entradas compradas       |
| `total`      | `number` | Total pagado                         |
| `metodoPago` | `string` | Método de pago usado                 |
| `fechaPago`  | `string` | Fecha del pago (ISO 8601)           |

---

## 🔄 Flujo de Procesamiento

```
1. Servicio de Compras publica mensaje en RabbitMQ
   ↓
2. Servicio de Notificaciones consume mensaje
   ↓
3. Obtiene datos del usuario (HTTP GET → Servicio de Usuarios)
   ↓
4. Obtiene datos del evento (HTTP GET → Servicio de Eventos)
   ↓
5. Genera contenido HTML del email
   ↓
6. Envía email vía SMTP (Gmail)
   ↓
7. Registra log de éxito/error
   ↓
8. Confirma mensaje (ACK) en RabbitMQ
```

---

## 📧 Ejemplo de Email Generado

El servicio genera emails HTML profesionales:

### Vista del Email:

```
┌─────────────────────────────────────────────┐
│         ✓ Pago Confirmado                   │  ← Gradient morado
│         Compra #000001                       │
├─────────────────────────────────────────────┤
│ Hola Franz Gonzales,                        │
│ ¡Tu pago ha sido procesado exitosamente! 🎉 │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 🎫 Concierto Rock 2025                  │ │
│ │ 📅 Fecha: sábado, 15 de marzo de 2025  │ │
│ │ 📍 Lugar: Estadio Nacional             │ │
│ │ 🎟️ Cantidad: 2 entradas                │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ 💳 Resumen de Pago                          │
│ Precio unitario         $150.50             │
│ Cantidad                2                    │
│ Método de pago          Tarjeta             │
│ ────────────────────────────────            │
│ Total Pagado            $301.00 ← Verde     │
│                                              │
│        [ Ver mis entradas ] ← Botón         │
└─────────────────────────────────────────────┘
```

**Características:**
- ✅ Diseño responsive (móvil y desktop)
- ✅ HTML + texto plano (fallback)
- ✅ Emojis y colores profesionales
- ✅ Compatible con Gmail, Outlook, Apple Mail, etc.

---

## 📁 Estructura del Proyecto

```
servicio-notificaciones/
├── src/
│   ├── index.ts                    # Punto de entrada
│   ├── config/
│   │   └── config.ts               # Configuración centralizada
│   ├── models/
│   │   └── notificacion.model.ts   # Interfaces TypeScript
│   ├── services/
│   │   ├── email.service.ts        # Lógica de envío de emails
│   │   ├── rabbitmq.service.ts     # Cliente RabbitMQ
│   │   ├── usuarios.client.ts      # Cliente HTTP para usuarios
│   │   └── eventos.client.ts       # Cliente HTTP para eventos
│   ├── templates/
│   │   └── email.template.ts       # Templates HTML de emails
│   └── utils/
│       └── logger.ts               # Logger Winston
├── logs/                            # Logs generados (auto-creado)
│   ├── notificaciones-service-2025-10-15.log
│   └── notificaciones-service-errors-2025-10-15.log
├── .env                             # Variables de entorno
├── .env.example                     # Plantilla de variables
├── package.json
├── tsconfig.json
└── README.MD
```

---

## 📊 Logs

Los logs se generan automáticamente en el directorio `logs/`:

```
logs/
├── notificaciones-service-2025-10-15.log         # Logs generales
└── notificaciones-service-errors-2025-10-15.log  # Solo errores
```

**Formato de logs:**
```
[2025-10-15 12:05:00] info: [notificaciones-service]: Mensaje recibido de RabbitMQ | CompraID: 1 | Usuario: 507f1f77bcf86cd799439011 | Evento: 1
[2025-10-15 12:05:01] debug: [notificaciones-service]: Llamada externa | Servicio: usuarios-service | Endpoint: /api/v1/users/507f1f77bcf86cd799439011 | Status: 200 | Duración: 45ms
[2025-10-15 12:05:02] debug: [notificaciones-service]: Llamada externa | Servicio: eventos-service | Endpoint: /eventos/1 | Status: 200 | Duración: 32ms
[2025-10-15 12:05:03] info: [notificaciones-service]: Email enviado exitosamente | Destinatario: franz@example.com | CompraID: 1 | MessageID: <abc@gmail.com> (234ms)
[2025-10-15 12:05:03] info: [notificaciones-service]: EVENTO DE NEGOCIO | Tipo: Notificación enviada | Datos: {"compraId":1,"usuarioId":"507f...","email":"franz@example.com"}
```

**Características del logging:**
- ✅ Rotación diaria de archivos
- ✅ Separación de logs de error
- ✅ Formato estructurado JSON
- ✅ Timestamps con timezone
- ✅ Métricas de duración de operaciones

---

## 🧪 Pruebas

### Publicar Mensaje de Prueba en RabbitMQ

```bash
# Opción 1: Desde la interfaz web
# http://localhost:15672 → Queues → notificaciones_compras → Publish message

# Opción 2: Con script Node.js
node -e "
const amqp = require('amqplib');
(async () => {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue('notificaciones_compras');
  ch.sendToQueue('notificaciones_compras', Buffer.from(JSON.stringify({
    compraId: 1,
    usuarioId: '507f1f77bcf86cd799439011',
    eventoId: 1,
    cantidad: 2,
    total: 301.00,
    metodoPago: 'tarjeta',
    fechaPago: new Date().toISOString()
  })));
  console.log('Mensaje enviado');
  await ch.close();
  await conn.close();
})();
"
```

### Verificar que el Email se Envió

1. **Revisa los logs**:
   ```bash
   tail -f logs/notificaciones-service-$(date +%Y-%m-%d).log
   ```

2. **Verifica tu bandeja de entrada** (si usas Gmail real)

3. **Si usas Ethereal**, busca la URL en los logs:
   ```
   [2025-10-15 12:05:03] info: [notificaciones-service]: 📧 Ver email en: https://ethereal.email/message/xxx
   ```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to RabbitMQ"
```bash
# Verificar que RabbitMQ esté corriendo
docker ps | grep rabbitmq

# Iniciar RabbitMQ
docker start rabbitmq

# O crear nuevo contenedor
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- Necesitas generar una **contraseña de aplicación** de Gmail (ver sección anterior)
- NO uses tu contraseña normal de Gmail
- Alternativamente, usa Ethereal para pruebas

### Error: "User not found" o "Event not found"
- Verifica que los otros microservicios estén corriendo:
  ```bash
  # Servicio de Usuarios
  curl http://localhost:3000/api/v1/users/507f1f77bcf86cd799439011
  
  # Servicio de Eventos
  curl http://localhost:3001/eventos/1
  ```

### Los mensajes no se procesan
```bash
# Verificar que hay mensajes en la cola
# http://localhost:15672 → Queues → notificaciones_compras

# Ver logs en tiempo real
npm run dev
```

---

## 🔗 Integración con Otros Microservicios

### Servicio de Compras (Python - puerto 3002)
- **Rol**: Publicador de mensajes
- **Envía**: Mensajes a RabbitMQ cuando se confirma un pago

### Servicio de Usuarios (Node.js - puerto 3000)
- **Rol**: Proveedor de datos
- **Endpoint usado**: `GET /api/v1/users/:id`
- **Datos obtenidos**: Nombre, email del usuario

### Servicio de Eventos (Rust - puerto 3001)
- **Rol**: Proveedor de datos
- **Endpoint usado**: `GET /eventos/:id`
- **Datos obtenidos**: Nombre, fecha, lugar, precio del evento

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "amqplib": "^0.10.9",           // Cliente RabbitMQ
    "axios": "^1.12.2",             // Cliente HTTP
    "dotenv": "^17.2.3",            // Variables de entorno
    "nodemailer": "^6.9.16",        // Envío de emails
    "winston": "^3.17.0",           // Logging
    "winston-daily-rotate-file": "^5.0.0"  // Rotación de logs
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/nodemailer": "^6.4.17",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.9.3"
  }
}
```

---

## 📝 Scripts Disponibles

```bash
npm run dev        # Desarrollo con hot-reload
npm run build      # Compilar TypeScript
npm start          # Producción (requiere build)
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

- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)