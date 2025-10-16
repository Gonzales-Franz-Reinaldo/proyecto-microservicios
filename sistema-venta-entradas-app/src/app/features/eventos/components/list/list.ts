import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Eventos } from '../../services/eventos';
import { Evento } from '../../../../core/models/evento';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  private eventosService = inject(Eventos);
  private router = inject(Router);
  
  eventos = signal<Evento[]>([]);
  eventosFiltrados = signal<Evento[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');
  filterStatus = signal<'todos' | 'proximos' | 'pasados'>('todos');

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.eventosService.getAllEventos().subscribe({
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

  applyFilters(): void {
    let filtered = [...this.eventos()];
    const now = new Date();

    // Filtrar por estado
    if (this.filterStatus() === 'proximos') {
      filtered = filtered.filter(e => new Date(e.fecha) >= now);
    } else if (this.filterStatus() === 'pasados') {
      filtered = filtered.filter(e => new Date(e.fecha) < now);
    }

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(e => 
        e.nombre.toLowerCase().includes(search) ||
        e.lugar.toLowerCase().includes(search)
      );
    }

    this.eventosFiltrados.set(filtered);
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onFilterChange(status: 'todos' | 'proximos' | 'pasados'): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  viewDetail(id: number): void {
    this.router.navigate(['/dashboard/admin/eventos/detalle', id]);
  }

  editEvento(id: number): void {
    this.router.navigate(['/dashboard/admin/eventos/editar', id]);
  }

  deleteEvento(evento: Evento): void {
    if (confirm(`¿Estás seguro de eliminar el evento "${evento.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      this.eventosService.deleteEvento(evento.id).subscribe({
        next: () => {
          alert('✅ Evento eliminado exitosamente');
          this.loadEventos(); // Recargar lista
        },
        error: (err) => {
          alert(`❌ Error: ${err.message}`);
        }
      });
    }
  }

  createEvento(): void {
    this.router.navigate(['/dashboard/admin/eventos/crear']);
  }

  isEventoPasado(fecha: string): boolean {
    return new Date(fecha) < new Date();
  }

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
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
}