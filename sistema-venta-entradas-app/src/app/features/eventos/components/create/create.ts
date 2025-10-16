import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Eventos } from '../../services/eventos';
import { EventoInput } from '../../../../core/models/evento';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private eventosService = inject(Eventos);
  
  eventoForm!: FormGroup;
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.initForm();
  }

  initForm(): void {
    // Fecha mínima: hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.eventoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      fecha: ['', [Validators.required, this.dateValidator(today)]],
      hora: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      capacidad: [100, [Validators.required, Validators.min(1), Validators.max(100000)]],
      precio: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]]
    });
  }

  /**
   * Validador personalizado: fecha no puede ser anterior a hoy
   */
  dateValidator(minDate: Date) {
    return (control: any) => {
      if (!control.value) return null;
      
      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < minDate) {
        return { pastDate: true };
      }
      
      return null;
    };
  }

  onSubmit(): void {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.eventoForm.value;
    
    // Combinar fecha y hora en formato ISO
    const fechaISO = `${formValue.fecha}T${formValue.hora}:00`;
    
    const eventoData: EventoInput = {
      nombre: formValue.nombre.trim(),
      fecha: fechaISO,
      lugar: formValue.lugar.trim(),
      capacidad: parseInt(formValue.capacidad, 10),
      precio: parseFloat(formValue.precio)
    };

    this.eventosService.createEvento(eventoData).subscribe({
      next: (evento) => {
        alert(`✅ Evento "${evento.nombre}" creado exitosamente`);
        this.router.navigate(['/dashboard/admin/eventos/detalle', evento.id]);
      },
      error: (err) => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    if (this.eventoForm.dirty) {
      if (confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.')) {
        this.router.navigate(['/dashboard/admin/eventos/lista']);
      }
    } else {
      this.router.navigate(['/dashboard/admin/eventos/lista']);
    }
  }

  // Getters para acceso fácil a los controles
  get nombre() { return this.eventoForm.get('nombre'); }
  get fecha() { return this.eventoForm.get('fecha'); }
  get hora() { return this.eventoForm.get('hora'); }
  get lugar() { return this.eventoForm.get('lugar'); }
  get capacidad() { return this.eventoForm.get('capacidad'); }
  get precio() { return this.eventoForm.get('precio'); }

  // Helper: fecha mínima para el input
  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}