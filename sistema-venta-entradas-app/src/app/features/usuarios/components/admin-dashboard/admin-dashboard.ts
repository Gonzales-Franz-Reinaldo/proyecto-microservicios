import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Usuarios } from '../../services/usuarios';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private authService = inject(Auth);
  private usuariosService = inject(Usuarios);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Filtros y búsqueda
  searchTerm = signal('');
  selectedRole = signal<'all' | 'admin' | 'user'>('all');

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAllUsers();
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    console.log('👤 Usuario actual:', user);
  }

  loadAllUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  // Computed: Usuarios filtrados
  get filteredUsers(): User[] {
    let filtered = this.users();

    // Filtrar por rol
    if (this.selectedRole() !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole());
    }

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  // Estadísticas
  get totalUsers(): number {
    return this.users().length;
  }

  get totalAdmins(): number {
    return this.users().filter(u => u.role === 'admin').length;
  }

  get totalRegularUsers(): number {
    return this.users().filter(u => u.role === 'user').length;
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onRoleFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | 'admin' | 'user';
    this.selectedRole.set(value);
  }

  deleteUser(user: User): void {
    if (user._id === this.currentUser()?._id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?\n\nEsta acción desactivará el usuario.`)) {
      
      this.usuariosService.deleteUser(user._id).subscribe({
        next: () => {
          console.log('Usuario eliminado');
          
          // Actualizar la lista eliminando el usuario
          this.users.update(users => users.filter(u => u._id !== user._id));
          alert(`Usuario "${user.name}" eliminado exitosamente`);
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert(`Error al eliminar: ${err.message}`);
        }
      });
    }
  }

  // CORREGIDO: Ahora recibe string en lugar de User
  viewUserDetail(userId: string): void {
    this.router.navigate(['/usuarios/detail', userId]);
  }

  navigateToUsersList(): void {
    console.log('Navegando a lista completa de usuarios');
    this.router.navigate(['/usuarios/list']);
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}