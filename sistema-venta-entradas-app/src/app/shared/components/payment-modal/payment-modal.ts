import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export interface PaymentData {
  metodo_pago: string;
  referencia?: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css'
})
export class PaymentModal {
  @Input() isOpen = false;
  @Input() total = 0;
  @Input() compraId = 0;
  @Output() confirm = new EventEmitter<PaymentData>();
  @Output() cancel = new EventEmitter<void>();

  selectedMethod = signal<string>('');
  referencia = signal<string>('');
  processing = signal(false);

  paymentMethods: PaymentMethod[] = [
    {
      id: 'tarjeta',
      name: 'Tarjeta de Crédito/Débito',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
      enabled: true
    },
    {
      id: 'transferencia',
      name: 'Transferencia Bancaria',
      icon: '🏦',
      description: 'Transferencia directa a cuenta bancaria',
      enabled: true
    },
    {
      id: 'qr',
      name: 'Código QR',
      icon: '📱',
      description: 'Pago mediante código QR (Banco app)',
      enabled: true
    },
    {
      id: 'efectivo',
      name: 'Efectivo',
      icon: '💵',
      description: 'Pago en puntos de venta autorizados',
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: 'Pago seguro con PayPal',
      enabled: false // Deshabilitado por ahora
    }
  ];

  selectMethod(methodId: string): void {
    this.selectedMethod.set(methodId);
    this.referencia.set(''); // Reset referencia
  }

  onConfirm(): void {
    const method = this.paymentMethods.find(m => m.id === this.selectedMethod());
    
    if (!method) {
      alert('⚠️ Por favor selecciona un método de pago');
      return;
    }

    const paymentData: PaymentData = {
      metodo_pago: method.name,
      referencia: this.referencia() || undefined
    };

    this.confirm.emit(paymentData);
  }

  onCancel(): void {
    this.reset();
    this.cancel.emit();
  }

  reset(): void {
    this.selectedMethod.set('');
    this.referencia.set('');
    this.processing.set(false);
  }

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB'
    }).format(precio);
  }
}