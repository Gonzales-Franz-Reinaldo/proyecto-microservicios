import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const USUARIOS_ROUTES: Routes = [
  //  Redirigir al dashboard según rol
  {
    path: '',
    canActivate: [authGuard],
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];