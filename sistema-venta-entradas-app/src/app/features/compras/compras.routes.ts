import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const COMPRAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'eventos',
        pathMatch: 'full'
      },
      {
        path: 'eventos',
        loadComponent: () => import('./components/list-events/list-events').then(m => m.ListEvents)
      },
      {
        path: 'realizar/:eventoId',
        loadComponent: () => import('./components/realizar-compora/realizar-compora').then(m => m.RealizarCompora)
      },
      {
        path: 'mis-compras',
        loadComponent: () => import('./components/mis-compras/mis-compras').then(m => m.MisCompras)
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./components/detalle-compra/detalle-compra').then(m => m.DetalleCompra)
      }
    ]
  }
];