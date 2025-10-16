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
  filteredUsers = signal<User[]>([]);
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
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.users();
    
    // Filtrar por rol
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    
    this.filteredUsers.set(filtered);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  viewDetail(userId: string): void {
    this.router.navigate(['/dashboard/admin/usuarios/detalle', userId]);
  }

  deleteUser(user: User): void {
    // No permitir eliminar al usuario actual
    if (user._id === this.currentUser()?._id) {
      alert('❌ No puedes eliminar tu propia cuenta');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?`)) {
      this.usuariosService.deleteUser(user._id).subscribe({
        next: () => {
          alert(`✅ Usuario "${user.name}" eliminado`);
          this.loadUsers(); // Recargar lista
        },
        error: (err) => {
          alert(`❌ Error: ${err.message}`);
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-user';
  }

  getRoleIcon(role: string): string {
    return role === 'admin' ? '👑' : '👤';
  }
}