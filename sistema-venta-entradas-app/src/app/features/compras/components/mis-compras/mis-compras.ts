import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Compras } from '../../services/compras';
import { CompraDetallada } from '../../../../core/models/compra';
import { PaymentModal, PaymentData } from '../../../../shared/components/payment-modal/payment-modal';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, PaymentModal],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css'
})
export class MisCompras implements OnInit {
  private comprasService = inject(Compras);
  public router = inject(Router);
  
  compras = signal<CompraDetallada[]>([]);
  comprasFiltradas = signal<CompraDetallada[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filterStatus = signal<'todas' | 'pendiente' | 'pagado' | 'cancelado'>('todas');
  processingId = signal<number | null>(null);
  
  // Modal states
  paymentModalOpen = signal(false);
  selectedCompra = signal<CompraDetallada | null>(null);

  ngOnInit(): void {
    this.loadCompras();
  }

  loadCompras(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comprasService.getMisCompras().subscribe({
      next: (compras) => {
        this.compras.set(compras);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(filter: 'todas' | 'pendiente' | 'pagado' | 'cancelado'): void {
    this.filterStatus.set(filter);
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.compras()];
    
    if (this.filterStatus() !== 'todas') {
      filtered = filtered.filter(c => c.estado === this.filterStatus());
    }
    
    filtered.sort((a, b) => {
      return new Date(b.fecha_compra).getTime() - new Date(a.fecha_compra).getTime();
    });
    
    this.comprasFiltradas.set(filtered);
  }

  verDetalle(compraId: number): void {
    this.router.navigate(['/dashboard/user/eventos/detalle', compraId]);
  }

  //  Abrir modal de pago
  pagarCompra(compra: CompraDetallada): void {
    if (compra.estado !== 'pendiente') {
      alert('⚠️ Solo puedes pagar compras en estado pendiente');
      return;
    }

    this.selectedCompra.set(compra);
    this.paymentModalOpen.set(true);
  }

  //  Confirmar pago desde modal
  onPaymentConfirm(paymentData: PaymentData): void {
    const compra = this.selectedCompra();
    if (!compra) return;

    this.processingId.set(compra.id);
    
    this.comprasService.pagarCompra(compra.id, paymentData.metodo_pago).subscribe({
      next: (compraActualizada) => {
        alert(`✅ Pago confirmado exitosamente\n\nMétodo: ${paymentData.metodo_pago}\nTotal: ${this.formatPrice(compra.total)}\n${paymentData.referencia ? `Referencia: ${paymentData.referencia}` : ''}`);
        this.paymentModalOpen.set(false);
        this.selectedCompra.set(null);
        this.loadCompras();
        this.processingId.set(null);
      },
      error: (err) => {
        alert(`❌ Error al procesar el pago: ${err.message}`);
        this.processingId.set(null);
      }
    });
  }

  // Cancelar modal
  onPaymentCancel(): void {
    this.paymentModalOpen.set(false);
    this.selectedCompra.set(null);
  }

  cancelarCompra(compra: CompraDetallada): void {
    if (compra.estado === 'cancelado') {
      alert('⚠️ Esta compra ya está cancelada');
      return;
    }

    if (compra.estado === 'pagado') {
      alert('⚠️ No puedes cancelar una compra que ya fue pagada. Contacta con soporte.');
      return;
    }

    if (!confirm(`¿Estás seguro de cancelar esta compra?\n\nEvento: ${compra.evento?.nombre}\nCantidad: ${compra.cantidad} entrada(s)\nTotal: ${this.formatPrice(compra.total)}\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.processingId.set(compra.id);
    
    this.comprasService.cancelarCompra(compra.id).subscribe({
      next: () => {
        alert('✅ Compra cancelada exitosamente');
        this.loadCompras();
        this.processingId.set(null);
      },
      error: (err) => {
        alert(`❌ Error al cancelar: ${err.message}`);
        this.processingId.set(null);
      }
    });
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

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatEventDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
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

  getTotalPagado(): number {
    return this.compras()
      .filter(c => c.estado === 'pagado')
      .reduce((sum, c) => sum + c.total, 0);
  }

  getTotalPendiente(): number {
    return this.compras()
      .filter(c => c.estado === 'pendiente')
      .reduce((sum, c) => sum + c.total, 0);
  }

  getComprasPagadas(): number {
    return this.compras().filter(c => c.estado === 'pagado').length;
  }

  getComprasPendientes(): number {
    return this.compras().filter(c => c.estado === 'pendiente').length;
  }

  getComprasCanceladas(): number {
    return this.compras().filter(c => c.estado === 'cancelado').length;
  }
}