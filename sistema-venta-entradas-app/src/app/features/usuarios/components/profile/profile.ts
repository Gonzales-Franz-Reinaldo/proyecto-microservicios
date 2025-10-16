import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Usuarios } from '../../services/usuarios';
import { Auth } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(Usuarios);
  private authService = inject(Auth);
  
  user = signal<User | null>(null);
  loading = signal(true);
  editing = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  
  profileForm!: FormGroup;

  ngOnInit(): void {
    this.user.set(this.authService.getCurrentUser());
    
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
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
      const user = this.user();
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    }
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user = this.user();
    if (!user) return;

    this.saving.set(true);
    const updatedData = this.profileForm.value;
    
    this.usuariosService.updateUser(user._id, updatedData).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        
        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        
        this.editing.set(false);
        this.saving.set(false);
        alert('✅ Perfil actualizado exitosamente');
      },
      error: (err) => {
        alert(`❌ Error: ${err.message}`);
        this.saving.set(false);
      }
    });
  }

  get name() { return this.profileForm.get('name'); }
  get email() { return this.profileForm.get('email'); }
}