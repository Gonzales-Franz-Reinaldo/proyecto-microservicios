import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  const user = authService.getCurrentUser();
  const requiredRole = route.data['role'] as 'admin' | 'user';
  
  console.log('  - Rol requerido:', requiredRole);
  console.log('  - Rol del usuario:', user?.role);
  
  if (!user) {
    console.log('No hay usuario, redirigiendo al login');
    router.navigate(['/auth/login']);
    return false;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    console.log(`Rol no autorizado. Requiere: ${requiredRole}, tiene: ${user.role}`);
    
    // Redirigir al dashboard correspondiente
    if (user.role === 'admin') {
      router.navigate(['/usuarios/admin-dashboard']);
    } else {
      router.navigate(['/usuarios/user-dashboard']);
    }
    return false;
  }
  
  console.log('Rol autorizado');
  return true;
};