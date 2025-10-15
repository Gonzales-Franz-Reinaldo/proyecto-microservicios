import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  
  if (authService.isLoggedIn()) {
    console.log('Usuario autenticado');
    return true;
  }
  
  console.log('Usuario NO autenticado, redirigiendo al login');
  
  // Guardar la URL a la que intentó acceder
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};