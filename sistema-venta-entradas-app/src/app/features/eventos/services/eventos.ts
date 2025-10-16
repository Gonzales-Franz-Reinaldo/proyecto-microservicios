import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  Evento, 
  EventoInput, 
  EventosResponse, 
  EventoCreateResponse,
  EventoUpdateResponse,
  EventoDeleteResponse
} from '../../../core/models/evento';

@Injectable({
  providedIn: 'root'
})
export class Eventos {
  private http = inject(HttpClient);
  private apiUrl = environment.eventosApiUrl; 

  /**
   * Obtener todos los eventos
   */
  getAllEventos(): Observable<Evento[]> {
    return this.http.get<EventosResponse>(`${this.apiUrl}/eventos`)
      .pipe(
        map(response => response.eventos),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un evento por ID
   */
  getEventoById(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/eventos/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo evento (solo admin)
   */
  createEvento(evento: EventoInput): Observable<Evento> {
    
    return this.http.post<EventoCreateResponse>(`${this.apiUrl}/eventos`, evento)
      .pipe(
        map(response => {
          return response.evento;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un evento existente (solo admin)
   */
  updateEvento(id: number, evento: EventoInput): Observable<number> {
    
    return this.http.put<EventoUpdateResponse>(`${this.apiUrl}/eventos/${id}`, evento)
      .pipe(
        map(response => {
          return response.id;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un evento (solo admin)
   */
  deleteEvento(id: number): Observable<number> {
    
    return this.http.delete<EventoDeleteResponse>(`${this.apiUrl}/eventos/${id}`)
      .pipe(
        map(response => {
          return response.id;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor de eventos';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Debes ser administrador';
    } else if (error.status === 404) {
      errorMessage = 'Evento no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Datos inválidos';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}