import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Usuarios } from '../../services/usuarios';
import { User } from '../../../../core/models/user';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private usuariosService = inject(Usuarios);
  private authService = inject(Auth);
  
  currentUser = signal<User | null>(null);
  user = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  editMode = signal(false);
  updateForm!: FormGroup;
  updating = signal(false);

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    
    // IMPORTANTE: Obtener el parámetro 'id' de la ruta (no '_id')
    const userId = this.route.snapshot.paramMap.get('id');
    console.log('ID de usuario desde ruta:', userId);
    
    if (userId) {
      this.loadUser(userId);
    } else {
      console.error('No se proporcionó ID de usuario');
      this.router.navigate(['/usuarios/list']);
    }

    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]]
    });
  }

  loadUser(userId: string): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getUserById(userId).subscribe({
      next: (user) => {
        console.log('Usuario cargado:', user);
        this.user.set(user);
        this.updateForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  toggleEditMode(): void {
    this.editMode.update(val => !val);
    if (!this.editMode()) {
      // Restaurar valores originales al cancelar
      const currentUser = this.user();
      if (currentUser) {
        this.updateForm.patchValue({
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        });
      }
    }
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser) return;

    this.updating.set(true);
    
    this.usuariosService.updateUser(currentUser._id, this.updateForm.value).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.editMode.set(false);
        this.updating.set(false);
        alert('Usuario actualizado exitosamente');
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        this.updating.set(false);
        alert(`Error: ${err.message}`);
      }
    });
  }

  deleteUser(): void {
    const currentUserData = this.user();
    if (!currentUserData) return;

    if (currentUserData._id === this.currentUser()?._id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario "${currentUserData.name}"?`)) {
      
      this.usuariosService.deleteUser(currentUserData._id).subscribe({
        next: () => {
          console.log('Usuario eliminado');
          alert('Usuario eliminado exitosamente');
          this.router.navigate(['/usuarios/list']);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert(`Error: ${err.message}`);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/usuarios/list']);
  }

  get name() {
    return this.updateForm.get('name');
  }

  get email() {
    return this.updateForm.get('email');
  }

  get role() {
    return this.updateForm.get('role');
  }
}