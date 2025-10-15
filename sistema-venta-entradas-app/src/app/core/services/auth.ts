import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';
  
  // Signals para estado reactivo
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal para el estado de autenticación
  isAuthenticated = signal<boolean>(this.hasToken());
  
  constructor() {
    // Verificar si hay un usuario en localStorage al iniciar
    this.loadUserFromStorage();
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token y usuario
          this.saveAuthData(response);
          // Redirigir según el rol
          this.redirectByRole(response.user.role);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          console.log('Usuario registrado exitosamente:', response.user.email);
          // NO guardar los datos ni redirigir al dashboard
          // Solo mostrar mensaje y redirigir al login
          alert(`¡Registro exitoso! Bienvenido ${response.user.name}. Ahora inicia sesión.`);
          this.router.navigate(['/auth/login']);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Logout de usuario
   */
  logout(): void {
    console.log('Cerrando sesión...');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.hasToken() && this.currentUserSubject.value !== null;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: 'admin' | 'user'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // ========== Métodos privados ==========

  /**
   * Guardar datos de autenticación en localStorage
   */
  private saveAuthData(response: AuthResponse): void {
    
    // Guardar token y usuario
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    
    // Actualizar estado
    this.currentUserSubject.next(response.user);
    this.isAuthenticated.set(true);
    
    console.log('👤 Usuario:', response.user.email);
    console.log('🔑 Token guardado:', response.token.substring(0, 20) + '...');
  }

  /**
   * Redirigir según el rol del usuario
   */
  private redirectByRole(role: 'admin' | 'user'): void {
    
    if (role === 'admin') {
      this.router.navigate(['/usuarios/admin-dashboard']);
    } else {
      this.router.navigate(['/usuarios/user-dashboard']);
    }
  }

  /**
   * Verificar si existe un token en localStorage
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener usuario desde localStorage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Cargar usuario desde localStorage al iniciar
   */
  private loadUserFromStorage(): void {
    const user = this.getUserFromStorage();
    const hasToken = this.hasToken();
    
    if (user && hasToken) {
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    } else {
      console.log('ℹ No hay sesión activa');
    }
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    
    console.error('Error en Auth:', error);
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
    } else if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas';
    } else if (error.status === 400) {
      errorMessage = 'Datos inválidos. Verifica los campos del formulario.';
    } else if (error.status === 409) {
      errorMessage = 'El email ya está registrado. Intenta con otro email o inicia sesión.';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}