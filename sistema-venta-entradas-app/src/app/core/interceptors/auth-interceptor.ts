import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  
  // Obtener token
  const token = authService.getToken();
  
  // Lista de URLs de servicios que requieren autenticación
  const apiUrls = [
    'http://localhost:3000',  // Servicio de usuarios (Node.js)
    'http://localhost:3001',  // Servicio de eventos (Rust)
    'http://localhost:3002'   // Servicio de compras (Python)
  ];
  
  // Verificar si la petición es hacia alguno de nuestros servicios
  const isApiRequest = apiUrls.some(url => req.url.startsWith(url));
  
  // Si hay token Y es una petición a nuestras APIs, agregarlo
  if (token && isApiRequest) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(cloned);
  }
  
  // Si no hay token en una petición protegida, loguear advertencia
  if (!token && isApiRequest) {
    console.warn('⚠️ Petición sin token JWT:', {
      url: req.url,
      method: req.method
    });
  }
  
  return next(req);
};