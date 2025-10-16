import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta raíz → Login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // ========== AUTH MODULE ==========
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ========== DASHBOARD MODULE (admin + user) ==========
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },

  // ========== FALLBACK: Usuarios (redirige al dashboard) ==========
  {
    path: 'usuarios',
    loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
  },

  // ========== 404 ==========
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];