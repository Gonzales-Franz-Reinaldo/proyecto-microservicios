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
