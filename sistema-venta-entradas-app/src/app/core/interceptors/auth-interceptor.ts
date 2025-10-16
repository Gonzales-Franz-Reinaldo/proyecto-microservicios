import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { environment } from '../../../environments/environment'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  
  // Obtener token
  const token = authService.getToken();
  
  // 2. Definir la lista de URLs base usando el objeto environment
  const apiBaseUrls = [
    // El interceptor solo necesita saber la base (host:port)
    environment.apiUrl.split('/api')[0], // => 'http://localhost:3000'
    environment.eventosApiUrl,          // => 'http://localhost:3001'
    environment.comprasApiUrl           // => 'http://localhost:3002'
  ];
  
  // Verificar si la petición es hacia alguno de nuestros servicios
  const isApiRequest = apiBaseUrls.some(url => req.url.startsWith(url));
  
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