import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Compras } from '../../services/compras';

@Component({
  selector: 'app-list-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-events.html',
  styleUrl: './list-events.css'
})
export class ListEvents implements OnInit {
  private comprasService = inject(Compras);
  private router = inject(Router);
  
  eventos = signal<any[]>([]);
  eventosFiltrados = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');
  filterStatus = signal<'todos' | 'proximos' | 'pasados'>('proximos');

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comprasService.getEventosDisponibles().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onFilterChange(filter: 'todos' | 'proximos' | 'pasados'): void {
    this.filterStatus.set(filter);
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.eventos()];
    
    // Filtrar por búsqueda
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(e => 
        e.nombre.toLowerCase().includes(term) || 
        e.lugar.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    const now = new Date();
    if (this.filterStatus() === 'proximos') {
      filtered = filtered.filter(e => new Date(e.fecha) >= now);
    } else if (this.filterStatus() === 'pasados') {
      filtered = filtered.filter(e => new Date(e.fecha) < now);
    }
    
    this.eventosFiltrados.set(filtered);
  }

  comprarEvento(eventoId: number): void {
    this.router.navigate(['/dashboard/user/eventos/realizar', eventoId]);
  }

  isEventoPasado(fecha: string): boolean {
    return new Date(fecha) < new Date();
  }

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB'
    }).format(precio);
  }

  getDaysUntilEvent(fecha: string): number {
    const now = new Date();
    const eventDate = new Date(fecha);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // ========== MÉTODOS AUXILIARES PARA TEMPLATES ==========
  
  getEventosProximos(): number {
    return this.eventos().filter(e => !this.isEventoPasado(e.fecha)).length;
  }

  getEventosPasados(): number {
    return this.eventos().filter(e => this.isEventoPasado(e.fecha)).length;
  }
}