import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Eventos } from '../../services/eventos';
import { Evento } from '../../../../core/models/evento';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventosService = inject(Eventos);
  private authService = inject(Auth);
  
  evento = signal<Evento | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  eventoId: number = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = parseInt(id, 10);
      this.loadEvento();
    } else {
      this.router.navigate(['/dashboard/admin/eventos/lista']);
    }
  }

  loadEvento(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.eventosService.getEventoById(this.eventoId).subscribe({
      next: (evento) => {
        this.evento.set(evento);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  editEvento(): void {
    this.router.navigate(['/dashboard/admin/eventos/editar', this.eventoId]);
  }

  deleteEvento(): void {
    const evento = this.evento();
    if (!evento) return;

    if (confirm(`¿Estás seguro de eliminar el evento "${evento.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      this.eventosService.deleteEvento(evento.id).subscribe({
        next: () => {
          alert('✅ Evento eliminado exitosamente');
          this.router.navigate(['/dashboard/admin/eventos/lista']);
        },
        error: (err) => {
          alert(`❌ Error: ${err.message}`);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/eventos/lista']);
  }

  isEventoPasado(): boolean {
    const evento = this.evento();
    if (!evento) return false;
    return new Date(evento.fecha) < new Date();
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

  getDaysUntilEvent(): number {
    const evento = this.evento();
    if (!evento) return 0;
    
    const now = new Date();
    const eventDate = new Date(evento.fecha);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getEventStatus(): string {
    const days = this.getDaysUntilEvent();
    if (days < 0) return 'Finalizado';
    if (days === 0) return '¡Hoy!';
    if (days === 1) return 'Mañana';
    if (days <= 7) return `En ${days} días`;
    return 'Próximamente';
  }
}