import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  Compra, 
  CompraDetallada, 
  CompraCreate, 
  CompraPago, 
  CompraListResponse,
  EventosDisponiblesResponse
} from '../../../core/models/compra';

@Injectable({
  providedIn: 'root'
})
export class Compras {
  private http = inject(HttpClient);
  private apiUrl = `${environment.comprasApiUrl}/api/compras`;

  /**
   * Obtener eventos disponibles para comprar
   */
  getEventosDisponibles(): Observable<any[]> {
    
    return this.http.get<EventosDisponiblesResponse>(`${this.apiUrl}/eventos`)
      .pipe(
        map(response => {
          return response.eventos;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Crear una nueva compra
   */
  crearCompra(compra: CompraCreate): Observable<Compra> {
    
    return this.http.post<Compra>(this.apiUrl, compra)
      .pipe(
        tap(response => {
          console.log('Compra creada:', response.id);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener todas las compras del usuario actual
   */
  getMisCompras(): Observable<CompraDetallada[]> {
    
    return this.http.get<CompraListResponse>(`${this.apiUrl}/mis-compras`)
      .pipe(
        map(response => {
          return response.compras;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener una compra específica por ID
   */
  getCompraById(id: number): Observable<Compra> {
    
    return this.http.get<Compra>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => {
          console.log('Compra obtenida:', response.id);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Confirmar pago de una compra
   */
  pagarCompra(id: number, metodoPago: string): Observable<Compra> {
    
    const pago: CompraPago = { metodo_pago: metodoPago };
    
    return this.http.post<Compra>(`${this.apiUrl}/${id}/pagar`, pago)
      .pipe(
        tap(response => {
          console.log('Pago confirmado:', response.id);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cancelar una compra
   */
  cancelarCompra(id: number): Observable<any> {
    
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => {
          console.log('Compra cancelada:', response.message);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en ComprasService:', error);
    
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error?.detail) {
      errorMessage = error.error.detail;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor de compras';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Debes iniciar sesión';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permiso para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.detail || 'Datos inválidos';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}