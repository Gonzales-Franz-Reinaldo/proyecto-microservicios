import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Eventos } from '../../services/eventos';
import { Evento, EventoInput } from '../../../../core/models/evento';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update.html',
  styleUrl: './update.css'
})
export class Update implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventosService = inject(Eventos);
  
  eventoForm!: FormGroup;
  evento = signal<Evento | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  eventoId: number = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = parseInt(id, 10);
      this.initForm();
      this.loadEvento();
    } else {
      this.router.navigate(['/dashboard/admin/eventos/lista']);
    }
  }

  initForm(): void {
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

  loadEvento(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.eventosService.getEventoById(this.eventoId).subscribe({
      next: (evento) => {
        this.evento.set(evento);
        this.populateForm(evento);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  populateForm(evento: Evento): void {
    // Separar fecha y hora del ISO string
    const fechaObj = new Date(evento.fecha);
    const fecha = fechaObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = fechaObj.toTimeString().slice(0, 5); // HH:mm

    this.eventoForm.patchValue({
      nombre: evento.nombre,
      fecha: fecha,
      hora: hora,
      lugar: evento.lugar,
      capacidad: evento.capacidad,
      precio: evento.precio
    });
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


    this.eventosService.updateEvento(this.eventoId, eventoData).subscribe({
      next: (id) => {
        alert(`✅ Evento actualizado exitosamente`);
        this.router.navigate(['/dashboard/admin/eventos/detalle', this.eventoId]);
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
        this.router.navigate(['/dashboard/admin/eventos/detalle', this.eventoId]);
      }
    } else {
      this.router.navigate(['/dashboard/admin/eventos/detalle', this.eventoId]);
    }
  }

  // Getters
  get nombre() { return this.eventoForm.get('nombre'); }
  get fecha() { return this.eventoForm.get('fecha'); }
  get hora() { return this.eventoForm.get('hora'); }
  get lugar() { return this.eventoForm.get('lugar'); }
  get capacidad() { return this.eventoForm.get('capacidad'); }
  get precio() { return this.eventoForm.get('precio'); }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}