import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    // Ruta raíz
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },

    // ========== RUTAS DE AUTENTICACIÓN (sin layout) ==========
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/components/login/login').then(m => m.Login)
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/components/register/register').then(m => m.Register)
            }
        ]
    },

    // ========== ADMIN LAYOUT (con navbar, sidebar y router-outlet) ==========
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
        children: [
            // Dashboard por defecto
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            // Dashboard principal
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/components/dashboard/dashboard').then(m => m.Dashboard)
            },
            // Gestión de usuarios
            {
                path: 'usuarios',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/admin/components/usuarios/usuarios-list/usuarios-list').then(m => m.UsuariosList)
                    },
                    {
                        path: 'detail/:id',
                        loadComponent: () => import('./features/admin/components/usuarios/usuario-detail/usuario-detail').then(m => m.UsuarioDetail)
                    }
                ]
            },
            // Gestión de eventos
            {
                path: 'eventos',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/admin/components/eventos/eventos-list/eventos-list').then(m => m.EventosListAdmin)
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./features/admin/components/eventos/evento-form/evento-form').then(m => m.EventoFormAdmin)
                    },
                    {
                        path: 'detail/:id',
                        loadComponent: () => import('./features/admin/components/eventos/evento-detail/evento-detail').then(m => m.EventoDetailAdmin)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./features/admin/components/eventos/evento-form/evento-form').then(m => m.EventoFormAdmin)
                    }
                ]
            },
            // Configuración
            {
                path: 'configuracion',
                loadComponent: () => import('./features/admin/components/configuracion/configuracion').then(m => m.Configuracion)
            }
        ]
    },

    // ========== USER DASHBOARD (lo haremos después) ==========
    {
        path: 'user',
        canActivate: [authGuard, roleGuard],
        data: { role: 'user' },
        loadComponent: () => import('./features/user/user-layout/user-layout').then(m => m.UserLayout),
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/user/components/dashboard/dashboard').then(m => m.UserDashboard)
            }
        ]
    },

    // Catch-all
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];