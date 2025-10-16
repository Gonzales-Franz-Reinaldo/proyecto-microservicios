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
    return this.getCurrentUser()?.role === 'admin';
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: 'admin' | 'user'): boolean {
    return this.getCurrentUser()?.role === role;
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
  }

  /**
   * Redirigir según el rol del usuario
   */
  private redirectByRole(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.router.navigate(['/dashboard/admin/dashboard']); 
    } else {
      this.router.navigate(['/dashboard/user/dashboard']); 
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
      } catch {
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
    if (user && this.hasToken()) {
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    }
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas';
    } else if (error.status === 409) {
      errorMessage = 'El email ya está registrado';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}