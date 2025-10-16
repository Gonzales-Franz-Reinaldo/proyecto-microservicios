import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { roleGuard } from '../../core/guards/role-guard';

export const EVENTOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      },
      {
        path: 'lista',
        loadComponent: () => import('./components/list/list').then(m => m.List)
      },
      {
        path: 'crear',
        loadComponent: () => import('./components/create/create').then(m => m.Create)
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./components/detail/detail').then(m => m.Detail)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./components/update/update').then(m => m.Update)
      }
    ]
  }
];