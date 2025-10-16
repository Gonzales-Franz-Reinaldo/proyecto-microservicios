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
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuariosService = inject(Usuarios);
  private authService = inject(Auth);
  
  user = signal<User | null>(null);
  currentUser = signal<User | null>(null);
  loading = signal(true);
  editing = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  
  editForm!: FormGroup;
  userId: string = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUser.set(this.authService.getCurrentUser());
    
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required]
    });

    if (this.userId) {
      this.loadUser();
    } else {
      this.router.navigate(['/usuarios/lista']);
    }
  }

  loadUser(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.editForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  toggleEdit(): void {
    this.editing.update(val => !val);
    if (!this.editing()) {
      // Restaurar valores originales al cancelar
      const user = this.user();
      if (user) {
        this.editForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    }
  }

  saveChanges(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const updatedData = this.editForm.value;
    
    this.usuariosService.updateUser(this.userId, updatedData).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.editing.set(false);
        this.saving.set(false);
        alert('✅ Usuario actualizado exitosamente');
      },
      error: (err) => {
        alert(`❌ Error: ${err.message}`);
        this.saving.set(false);
      }
    });
  }

  deleteUser(): void {
    const user = this.user();
    if (!user) return;

    // Evitar eliminar al usuario actual
    if (user._id === this.currentUser()?._id) {
      alert('❌ No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?\n\nEsta acción no se puede deshacer.`)) {
      this.usuariosService.deleteUser(this.userId).subscribe({
        next: () => {
          alert('✅ Usuario eliminado exitosamente');
          this.router.navigate(['/dashboard/admin/usuarios/lista']); 
        },
        error: (err) => {
          alert(`❌ Error: ${err.message}`);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/usuarios/lista']); 
  }

  get name() { return this.editForm.get('name'); }
  get email() { return this.editForm.get('email'); }
  get role() { return this.editForm.get('role'); }

  get isCurrentUser(): boolean {
    return this.user()?._id === this.currentUser()?._id;
  }
}