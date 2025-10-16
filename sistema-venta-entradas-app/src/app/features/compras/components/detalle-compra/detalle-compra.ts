import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Compras } from '../../services/compras';
import { Compra } from '../../../../core/models/compra';
import { PaymentModal, PaymentData } from '../../../../shared/components/payment-modal/payment-modal';

@Component({
  selector: 'app-detalle-compra',
  standalone: true,
  imports: [CommonModule, PaymentModal],
  templateUrl: './detalle-compra.html',
  styleUrl: './detalle-compra.css'
})
export class DetalleCompra implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comprasService = inject(Compras);
  
  compra = signal<Compra | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  processing = signal(false);
  compraId: number = 0;
  
  // Modal states
  paymentModalOpen = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.compraId = parseInt(id, 10);
      this.loadCompra();
    } else {
      this.router.navigate(['/dashboard/user/mis-entradas']);
    }
  }

  loadCompra(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comprasService.getCompraById(this.compraId).subscribe({
      next: (compra) => {
        this.compra.set(compra);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  // Abrir modal
  pagarCompra(): void {
    const compra = this.compra();
    if (!compra || compra.estado !== 'pendiente') {
      alert('⚠️ Solo puedes pagar compras en estado pendiente');
      return;
    }

    this.paymentModalOpen.set(true);
  }

  // Confirmar desde modal
  onPaymentConfirm(paymentData: PaymentData): void {
    const compra = this.compra();
    if (!compra) return;

    this.processing.set(true);
    
    this.comprasService.pagarCompra(compra.id, paymentData.metodo_pago).subscribe({
      next: (compraActualizada) => {
        alert(`✅ Pago confirmado exitosamente\n\nMétodo: ${paymentData.metodo_pago}\nTotal: ${this.formatPrice(compra.total)}`);
        this.paymentModalOpen.set(false);
        this.loadCompra();
        this.processing.set(false);
      },
      error: (err) => {
        alert(`❌ Error al procesar el pago: ${err.message}`);
        this.processing.set(false);
      }
    });
  }

  // Cancelar modal
  onPaymentCancel(): void {
    this.paymentModalOpen.set(false);
  }

  cancelarCompra(): void {
    const compra = this.compra();
    if (!compra) return;

    if (compra.estado === 'cancelado') {
      alert('⚠️ Esta compra ya está cancelada');
      return;
    }

    if (compra.estado === 'pagado') {
      alert('⚠️ No puedes cancelar una compra que ya fue pagada. Contacta con soporte.');
      return;
    }

    if (!confirm(`¿Estás seguro de cancelar esta compra?\n\nID: ${compra.id}\nTotal: ${this.formatPrice(compra.total)}\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.processing.set(true);
    
    this.comprasService.cancelarCompra(compra.id).subscribe({
      next: () => {
        alert('✅ Compra cancelada exitosamente');
        this.router.navigate(['/dashboard/user/mis-entradas']);
      },
      error: (err) => {
        alert(`❌ Error al cancelar: ${err.message}`);
        this.processing.set(false);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/user/mis-entradas']);
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'pagado': return 'badge-pagado';
      case 'cancelado': return 'badge-cancelado';
      default: return '';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'pagado': return '✅';
      case 'cancelado': return '❌';
      default: return '📋';
    }
  }

  formatDate(fecha: string | undefined): string {
    if (!fecha) {
      return 'Fecha no disponible';
    }
    
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

  printTicket(): void {
    window.print();
  }

  downloadTicket(): void {
    alert('🎫 Función de descarga en desarrollo...\n\nPuedes usar Ctrl+P para imprimir tu ticket.');
  }
}