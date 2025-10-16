import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Compras } from '../../services/compras';
import { CompraCreate } from '../../../../core/models/compra';

@Component({
  selector: 'app-realizar-compora',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './realizar-compora.html',
  styleUrl: './realizar-compora.css'
})
export class RealizarCompora implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comprasService = inject(Compras);
  
  compraForm!: FormGroup;
  evento = signal<any | null>(null);
  eventoId: number = 0;
  loading = signal(true);
  processing = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('eventoId');
    if (id) {
      this.eventoId = parseInt(id, 10);
      this.initForm();
      this.loadEvento();
    } else {
      this.router.navigate(['/dashboard/user/eventos']);
    }
  }

  initForm(): void {
    this.compraForm = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  loadEvento(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comprasService.getEventosDisponibles().subscribe({
      next: (eventos) => {
        const eventoEncontrado = eventos.find(e => e.id === this.eventoId);
        if (eventoEncontrado) {
          this.evento.set(eventoEncontrado);
          this.loading.set(false);
        } else {
          this.error.set('Evento no encontrado');
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
        console.error('Error al cargar evento:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.compraForm.invalid) {
      this.compraForm.markAllAsTouched();
      return;
    }

    const evento = this.evento();
    if (!evento) return;

    // Validar capacidad
    const cantidad = this.compraForm.value.cantidad;
    if (cantidad > evento.capacidad) {
      alert(`⚠️ Solo hay ${evento.capacidad} entradas disponibles`);
      return;
    }

    // Confirmar compra
    const total = this.getTotal();
    if (!confirm(`¿Confirmar compra de ${cantidad} entrada(s) por ${this.formatPrice(total)}?`)) {
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    const compraData: CompraCreate = {
      evento_id: this.eventoId,
      cantidad: cantidad
    };

    this.comprasService.crearCompra(compraData).subscribe({
      next: (compra) => {
        alert(`✅ Compra realizada exitosamente\n\nID de compra: ${compra.id}\nTotal: ${this.formatPrice(compra.total)}\n\nPuedes completar el pago desde "Mis Entradas"`);
        this.router.navigate(['/dashboard/user/mis-entradas']);
      },
      error: (err) => {
        console.error('Error al crear compra:', err);
        this.error.set(err.message);
        this.processing.set(false);
      }
    });
  }

  cancel(): void {
    if (this.compraForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Se perderán los datos ingresados.')) {
        this.router.navigate(['/dashboard/user/eventos']);
      }
    } else {
      this.router.navigate(['/dashboard/user/eventos']);
    }
  }

  getTotal(): number {
    const evento = this.evento();
    if (!evento) return 0;
    return evento.precio * this.cantidad?.value;
  }

  get cantidad() {
    return this.compraForm.get('cantidad');
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

  isEventoPasado(): boolean {
    const evento = this.evento();
    if (!evento) return false;
    return new Date(evento.fecha) < new Date();
  }
}