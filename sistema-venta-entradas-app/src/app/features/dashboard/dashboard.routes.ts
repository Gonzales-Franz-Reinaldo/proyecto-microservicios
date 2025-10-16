import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { roleGuard } from '../../core/guards/role-guard';

export const DASHBOARD_ROUTES: Routes = [
  // ========== ADMIN DASHBOARD ==========
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadComponent: () => import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      // PERFIL DEL ADMIN 
      {
        path: 'perfil',
        loadComponent: () => import('../usuarios/components/profile/profile').then(m => m.Profile)
      },
      // USUARIOS - Rutas hijas dentro de AdminLayout
      {
        path: 'usuarios',
        children: [
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full'
          },
          {
            path: 'lista',
            loadComponent: () => import('../usuarios/components/list/list').then(m => m.List)
          },
          {
            path: 'detalle/:id',
            loadComponent: () => import('../usuarios/components/detail/detail').then(m => m.Detail)
          }
        ]
      },
      // EVENTOS (NUEVA SECCIÓN)
      {
        path: 'eventos',
        loadChildren: () => import('../eventos/eventos.routes').then(m => m.EVENTOS_ROUTES)
      },
      // REPORTES - Placeholder
      {
        path: 'reportes',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      }
    ]
  },

  // ========== USER DASHBOARD ==========
  {
    path: 'user',
    canActivate: [authGuard, roleGuard],
    data: { role: 'user' },
    loadComponent: () => import('./user-layout/user-layout').then(m => m.UserLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/user-dashboard/user-dashboard').then(m => m.UserDashboard)
      },
      // PERFIL - Disponible para usuarios normales
      {
        path: 'perfil',
        loadComponent: () => import('../usuarios/components/profile/profile').then(m => m.Profile)
      },
      // EVENTOS - Placeholder
      {
        path: 'eventos',
        loadComponent: () => import('./components/user-dashboard/user-dashboard').then(m => m.UserDashboard)
      },
      {
        path: 'mis-entradas',
        loadComponent: () => import('./components/user-dashboard/user-dashboard').then(m => m.UserDashboard)
      }
    ]
  },

  // ========== REDIRECT ==========
  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full'
  }
];