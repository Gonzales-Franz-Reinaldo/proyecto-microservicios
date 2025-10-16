import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL).pipe(
      tap(users => console.log('Usuarios obtenidos:', users.length)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`).pipe(
      tap(user => console.log('Usuario obtenido:', user.email)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener perfil del usuario actual
   */
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => console.log('Perfil obtenido:', user.email)),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar usuario
   */
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, userData).pipe(
      tap(user => console.log('Usuario actualizado:', user.email)),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar usuario (soft delete)
   */
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`).pipe(
      tap(() => console.log('Usuario eliminado:', id)),
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Usuario no encontrado';
    }
    
    console.error('Error en UsuariosService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}