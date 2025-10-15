import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
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
    {
        path: 'usuarios',
        canActivate: [authGuard],
        children: [
            {
                path: 'user-dashboard',
                canActivate: [roleGuard],
                data: { role: 'user' },
                loadComponent: () => import('./features/usuarios/components/user-dashboard/user-dashboard').then(m => m.UserDashboard)
            },
            {
                path: 'admin-dashboard',
                canActivate: [roleGuard],
                data: { role: 'admin' },
                loadComponent: () => import('./features/usuarios/components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
            },
            {
                path: 'list',
                canActivate: [roleGuard],
                data: { role: 'admin' },
                loadComponent: () => import('./features/usuarios/components/list/list').then(m => m.List)
            },
            {
                path: 'detail/:id',
                canActivate: [roleGuard],
                data: { role: 'admin' },
                loadComponent: () => import('./features/usuarios/components/detail/detail').then(m => m.Detail)
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];