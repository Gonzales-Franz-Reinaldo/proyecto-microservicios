import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register').then(m => m.Register)
    }
];