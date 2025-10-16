import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();

  // Solo agregar token si existe y la petición es a nuestras APIs
  if (token && (req.url.includes('localhost:3000') || req.url.includes('localhost:3001'))) {
    console.log('🔐 Agregando token a la petición:', req.url);
    
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedRequest);
  }

  return next(req);
};