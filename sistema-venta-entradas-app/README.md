# SistemaVentaEntradasApp

```bash
sistema-venta-entradas-app/
├── angular.json
├── package.json
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── core/                  # Singleton services, interceptors, guards
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── http.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── http.service.ts
│   │   │   └── core.module.ts     # O usa standalone en app.config.ts
│   │   ├── shared/                # Componentes, directivas y pipes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   │   ├── button.component.ts
│   │   │   │   │   ├── button.component.html
│   │   │   │   │   └── button.component.scss
│   │   │   │   └── modal/
│   │   │   ├── directives/
│   │   │   │   └── highlight.directive.ts
│   │   │   ├── pipes/
│   │   │   │   └── search.pipe.ts
│   │   │   └── shared.module.ts   # Exporta todo lo reutilizable
│   │   ├── features/              # Módulos por feature (lazy-loaded)
│   │   │   ├── usuarios/          # Ejemplo de feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── list/
│   │   │   │   │   │   ├── usuarios-list.component.ts
│   │   │   │   │   │   ├── usuarios-list.component.html
│   │   │   │   │   │   └── usuarios-list.component.scss
│   │   │   │   │   └── detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── usuarios.service.ts
│   │   │   │   └── usuarios.module.ts
│   │   │   └── productos/         # Otra feature similar
│   │   │       ├── ...
│   │   ├── app.component.ts       # Componente raíz con <router-outlet>
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts          # Providers globales (imports, providers)
│   │   ├── app.routes.ts          # Rutas principales con lazy loading
│   │   └── app.module.ts          # Si usas módulos; opcional con standalone
│   ├── assets/                    # Imágenes, fonts (por defecto)
│   ├── environments/              # Configuraciones por entorno
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts                    # Bootstrap de la app
│   └── styles.scss                # Estilos globales
├── node_modules/
├── public/                        # Archivos estáticos (por defecto)
└── ... (otros archivos como package-lock.json, etc.)
```




sistema-venta-entradas-app/
├── angular.json                          # Configuración de build y schematics (agrega i18n si es necesario)
├── package.json                          # Dependencias: @angular/material? para UI, rxjs para observables
├── tsconfig.json                         # Configuración TypeScript global
├── src/
│   ├── app/
│   │   ├── core/                        # Elementos singleton globales (no lazy-loaded, importados en app.config.ts)
│   │   │   ├── guards/                  # Guards para autenticación y roles (CanActivateFn)
│   │   │   │   ├── auth.guard.ts        # Protege todas las rutas post-auth
│   │   │   │   └── role.guard.ts        # Protege rutas por rol (data: { roles: ['admin'] })
│   │   │   ├── interceptors/            # Interceptors HTTP (JWT automático)
│   │   │   │   └── http.interceptor.ts  # Clona requests con header Authorization: Bearer ${token}
│   │   │   ├── services/                # Servicios globales
│   │   │   │   ├── auth.service.ts      # Manejo de login/register (POST a /auth), currentUser (BehaviorSubject con rol), logout, isAdmin()
│   │   │   │   └── http.service.ts      # Wrapper para HttpClient (get/post/put/delete con baseUrl por microservicio)
│   │   │   └── core.module.ts           # Providers: HTTP_INTERCEPTORS, AuthService, HttpService
│   │   ├── shared/                      # Elementos reutilizables (importados en features y módulos)
│   │   │   ├── components/              # Componentes UI comunes (standalone)
│   │   │   │   ├── navbar/              # Navbar dinámica (menús condicionales por rol: user=Compras; admin=Usuarios+Eventos)
│   │   │   │   │   ├── navbar.component.ts
│   │   │   │   │   ├── navbar.component.html  # <nav> con *ngIf="auth.isAdmin()"> enlaces a gestión
│   │   │   │   │   └── navbar.component.scss
│   │   │   │   ├── footer/              # Footer estático (información de la app)
│   │   │   │   │   ├── footer.component.ts
│   │   │   │   │   ├── footer.component.html
│   │   │   │   │   └── footer.component.scss
│   │   │   │   ├── button/              # Botón reutilizable (submit, cancelar)
│   │   │   │   │   ├── button.component.ts
│   │   │   │   │   ├── button.component.html
│   │   │   │   │   └── button.component.scss
│   │   │   │   ├── modal/               # Modal para confirmaciones (pago, eliminar evento)
│   │   │   │   │   ├── modal.component.ts
│   │   │   │   │   ├── modal.component.html
│   │   │   │   │   └── modal.component.scss
│   │   │   │   └── form-field/          # Campo de formulario genérico (email, password, cantidad de entradas)
│   │   │   │       ├── form-field.component.ts
│   │   │   │       ├── form-field.component.html
│   │   │   │       └── form-field.component.scss
│   │   │   ├── directives/              # Directivas (ej. highlight para errores en forms)
│   │   │   │   └── highlight.directive.ts
│   │   │   ├── pipes/                   # Pipes (búsqueda en listas, formato de moneda para precios de entradas)
│   │   │   │   ├── search.pipe.ts       # Filtra listas de eventos/usuarios
│   │   │   │   └── currency.pipe.ts     # Formatea precios (ej. $10.00)
│   │   │   └── shared.module.ts         # Exporta: NavbarComponent, FooterComponent, ButtonComponent, ModalComponent, etc.
│   │   ├── features/                    # Features lazy-loaded (por microservicio, con routing children)
│   │   │   ├── auth/                    # Feature: Autenticación (Servicio de Usuarios - común para ambos roles)
│   │   │   │   ├── components/          # Componentes standalone
│   │   │   │   │   ├── login/           # Formulario de login (redirige a dashboard por rol)
│   │   │   │   │   │   ├── login.component.ts  # Inyecta AuthService.login(), subscribe para detectar rol
│   │   │   │   │   │   ├── login.component.html
│   │   │   │   │   │   └── login.component.scss
│   │   │   │   │   └── register/        # Formulario de registro (rol por defecto 'user', admin manual)
│   │   │   │   │       ├── register.component.ts
│   │   │   │   │       ├── register.component.html
│   │   │   │   │       └── register.component.scss
│   │   │   │   └── auth.module.ts       # Imports: SharedModule, CoreModule, RouterModule
│   │   │   │   └── auth-routing.module.ts # Rutas: { path: 'login', component: LoginComponent }, { path: 'register', component: RegisterComponent }
│   │   │   ├── dashboard/               # Feature: Dashboards por rol (renderizado dinámico vía router-outlet)
│   │   │   │   ├── components/          # Componentes standalone
│   │   │   │   │   ├── user/            # Dashboard para user (enlaces a compras, eventos disponibles, notificaciones)
│   │   │   │   │   │   ├── user-dashboard.component.ts
│   │   │   │   │   │   ├── user-dashboard.component.html  # <h1>Bienvenido User</h1> <a routerLink="/compras/list-events">Comprar Entradas</a>
│   │   │   │   │   │   └── user-dashboard.component.scss
│   │   │   │   │   └── admin/           # Dashboard para admin (enlaces a gestión de usuarios/eventos)
│   │   │   │   │       ├── admin-dashboard.component.ts
│   │   │   │   │       ├── admin-dashboard.component.html # <h1>Panel Admin</h1> <a routerLink="/usuarios/list">Gestionar Usuarios</a> <a routerLink="/eventos/create">Crear Evento</a>
│   │   │   │   │       └── admin-dashboard.component.scss
│   │   │   │   └── dashboard.module.ts
│   │   │   │   └── dashboard-routing.module.ts # Rutas: { path: 'user', component: UserDashboardComponent }, { path: 'admin', canActivate: [roleGuard], data: { roles: ['admin'] }, component: AdminDashboardComponent }
│   │   │   ├── usuarios/                # Feature: Gestión de Usuarios (solo admin para CRUD; perfil para user/admin)
│   │   │   │   ├── components/
│   │   │   │   │   ├── profile/         # Perfil propio (muestra name, email, rol de AuthService.currentUser)
│   │   │   │   │   │   ├── profile.component.ts
│   │   │   │   │   │   ├── profile.component.html
│   │   │   │   │   │   └── profile.component.scss
│   │   │   │   │   ├── list/            # Lista de usuarios (solo admin)
│   │   │   │   │   │   ├── usuarios-list.component.ts  # Usa UsuariosService.getAll(), aplica search pipe
│   │   │   │   │   │   ├── usuarios-list.component.html  # Tabla con botones delete/update
│   │   │   │   │   │   └── usuarios-list.component.scss
│   │   │   │   │   └── detail/          # Detalle/edición de usuario (admin o propio)
│   │   │   │   │       ├── usuarios-detail.component.ts
│   │   │   │   │       ├── usuarios-detail.component.html
│   │   │   │   │       └── usuarios-detail.component.scss
│   │   │   │   ├── services/
│   │   │   │   │   └── usuarios.service.ts # Llamadas API: getMe(), getAllUsers(), updateUser(id), deleteUser(id)
│   │   │   │   └── usuarios.module.ts
│   │   │   │   └── usuarios-routing.module.ts # Rutas: { path: 'profile', component: ProfileComponent }, { path: 'list', canActivate: [roleGuard], data: { roles: ['admin'] }, component: ListComponent }
│   │   │   ├── eventos/                 # Feature: Gestión de Eventos (CRUD solo admin; lista para user)
│   │   │   │   ├── components/
│   │   │   │   │   ├── list/            # Lista de eventos (user: disponibles; admin: todas)
│   │   │   │   │   │   ├── eventos-list.component.ts  # Filtra por rol (user: eventos activos)
│   │   │   │   │   │   ├── eventos-list.component.html
│   │   │   │   │   │   └── eventos-list.component.scss
│   │   │   │   │   ├── detail/          # Detalle de evento (precio, capacidad, lugar)
│   │   │   │   │   │   ├── eventos-detail.component.ts
│   │   │   │   │   │   ├── eventos-detail.component.html
│   │   │   │   │   │   └── eventos-detail.component.scss
│   │   │   │   │   ├── create/          # Formulario crear evento (solo admin)
│   │   │   │   │   │   ├── eventos-create.component.ts  # Usa EventosService.create()
│   │   │   │   │   │   ├── eventos-create.component.html  # <app-form-field> para nombre, fecha, etc.
│   │   │   │   │   │   └── eventos-create.component.scss
│   │   │   │   │   └── update/          # Formulario editar evento (solo admin)
│   │   │   │   │       ├── eventos-update.component.ts
│   │   │   │   │       ├── eventos-update.component.html
│   │   │   │   │       └── eventos-update.component.scss
│   │   │   │   ├── services/
│   │   │   │   │   └── eventos.service.ts # Llamadas API: getAll(), getById(), create(), update(), delete()
│   │   │   │   └── eventos.module.ts
│   │   │   │   └── eventos-routing.module.ts # Rutas: { path: 'list', component: ListComponent }, { path: 'create', canActivate: [roleGuard], data: { roles: ['admin'] }, component: CreateComponent }
│   │   │   ├── compras/                 # Feature: Compras (solo user; requiere auth)
│   │   │   │   ├── components/
│   │   │   │   │   ├── list-events/     # Lista de eventos disponibles para compra
│   │   │   │   │   │   ├── list-events.component.ts
│   │   │   │   │   │   ├── list-events.component.html  # Botón "Comprar" enlaza a /buy/:id
│   │   │   │   │   │   └── list-events.component.scss
│   │   │   │   │   ├── buy/             # Formulario de compra (cantidad, total con currency pipe)
│   │   │   │   │   │   ├── buy.component.ts  # ComprasService.createCompra(), luego simular /pagar
│   │   │   │   │   │   ├── buy.component.html  # <app-modal> para confirmación de pago
│   │   │   │   │   │   └── buy.component.scss
│   │   │   │   │   └── my-purchases/    # Historial de compras del user
│   │   │   │   │       ├── my-purchases.component.ts  # ComprasService.getMyCompras()
│   │   │   │   │       ├── my-purchases.component.html
│   │   │   │   │       └── my-purchases.component.scss
│   │   │   │   ├── services/
│   │   │   │   │   └── compras.service.ts # Llamadas API: getEventsForSale(), createCompra(eventoId, cantidad), pagar(compraId), getMyCompras()
│   │   │   │   └── compras.module.ts
│   │   │   │   └── compras-routing.module.ts # Rutas: { path: '', redirectTo: 'list-events' }, { path: 'buy/:id', canActivate: [roleGuard], data: { roles: ['user'] }, component: BuyComponent }
│   │   │   └── notificaciones/          # Feature: Notificaciones (historial para user; opcional para admin)
│   │   │       ├── components/
│   │   │       │   ├── list/            # Lista de emails recibidos (post-compra)
│   │   │       │   │   ├── notificaciones-list.component.ts  # NotificacionesService.getMyNotifications()
│   │   │       │   │   ├── notificaciones-list.component.html
│   │   │       │   │   └── notificaciones-list.component.scss
│   │   │       │   └── detail/          # Detalle de notificación (email)
│   │   │       │       ├── notificaciones-detail.component.ts
│   │   │       │       ├── notificaciones-detail.component.html
│   │   │       │       └── notificaciones-detail.component.scss
│   │   │       ├── services/
│   │   │       │   └── notificaciones.service.ts # Llamadas API: getMyNotifications() (fetch desde backend/RabbitMQ)
│   │   │       └── notificaciones.module.ts
│   │   │       └── notificaciones-routing.module.ts # Rutas: { path: '', component: ListComponent }
│   │   ├── app.component.ts             # Lógica raíz (inyecta AuthService para determinar rol)
│   │   ├── app.component.html           # Layout global: <app-navbar></app-navbar> <main class="container"> <router-outlet></router-outlet> </main> <app-footer></app-footer>
│   │   ├── app.component.scss           # Estilos para main (container flex, etc.)
│   │   ├── app.config.ts                # Providers: provideRouter(routes), provideHttpClient(), CoreModule
│   │   ├── app.routes.ts                # Rutas principales: { path: 'dashboard', canActivate: [authGuard], loadChildren: () => import('./features/dashboard/...') }, { path: 'compras', canActivate: [authGuard, roleGuard], data: { roles: ['user'] }, ... }
│   │   └── main.ts                      # Bootstrap: bootstrapApplication(AppComponent, appConfig)
│   ├── assets/                          # Recursos estáticos
│   │   ├── images/                      # Logos de eventos, imágenes de UI
│   │   └── icons/                       # Íconos para navbar (user/admin)
│   ├── environments/                    # Configuraciones por entorno
│   │   ├── environment.ts               # apiUrl: { users: 'http://localhost:3000/api/v1', eventos: 'http://localhost:3001/api/v1', compras: '...', notificaciones: '...' }
│   │   └── environment.prod.ts          # URLs de producción
│   ├── index.html                       # Punto de entrada HTML: <base href="/">, <title>Sistema Venta Entradas</title>
│   └── styles.scss                      # Estilos globales: variables SCSS (--primary-color, temas por rol si se desea)
├── node_modules/                        # Dependencias instaladas
├── public/                              # Archivos públicos: favicon.ico, manifest.json (para PWA opcional)
├── .gitignore                           # Archivos ignorados por Git
├── README.md                            # Documentación: setup (npm install, ng serve), endpoints de backend
└── ... (package-lock.json, tsconfig.app.json, tsconfig.spec.json, karma.conf.js, etc.)