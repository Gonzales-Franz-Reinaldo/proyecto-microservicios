import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un usuario por ID
   * @param _id - El _id de MongoDB del usuario
   */
  getUserById(_id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${_id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener el perfil del usuario actual
   */
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar un usuario
   * @param _id - El _id de MongoDB del usuario
   * @param userData - Datos a actualizar
   */
  updateUser(_id: string, userData: Partial<User>): Observable<User> {
    
    // Remover _id del body si existe (no se debe enviar en el body)
    const { _id: removedId, ...dataToSend } = userData as any;
    
    return this.http.put<User>(`${this.baseUrl}/${_id}`, dataToSend)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un usuario (solo admin)
   * @param _id - El _id de MongoDB del usuario
   */
  deleteUser(_id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${_id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    
    console.error('Error en servicio de usuarios:', error);
    console.error('  Status:', error.status);
    console.error('  URL:', error.url);
    console.error('  Error body:', error.error);
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.status === 400) {
      errorMessage = 'Datos inválidos';
    } else if (error.status === 401) {
      errorMessage = 'No estás autenticado';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Usuario no encontrado';
    } else if (error.status === 409) {
      errorMessage = 'El email ya está en uso';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}