import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuarios } from '../../services/usuarios';
import { User } from '../../../../core/models/user';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  private usuariosService = inject(Usuarios);
  private authService = inject(Auth);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = '';
  selectedRole: 'all' | 'admin' | 'user' = 'all';

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  get filteredUsers(): User[] {
    let filtered = this.users();
    
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  viewDetail(userId: string): void {
    this.router.navigate(['/usuarios/detail', userId]);
  }

  deleteUser(user: User): void {
    
    if (user._id === this.currentUser()?._id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }
    
    if (confirm(`¿Eliminar al usuario "${user.name}"?`)) {
      this.usuariosService.deleteUser(user._id).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u._id !== user._id));
          alert(`Usuario "${user.name}" eliminado`);
        },
        error: (err) => {
          console.error('Error:', err);
          alert(`Error: ${err.message}`);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/usuarios/admin-dashboard']);
  }
}