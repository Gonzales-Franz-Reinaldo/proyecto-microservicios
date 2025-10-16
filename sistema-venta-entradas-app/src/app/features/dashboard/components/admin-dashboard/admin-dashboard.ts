import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Usuarios } from '../../../usuarios/services/usuarios'; 
import { User } from '../../../../core/models/user';

interface DashboardStats {
  totalUsuarios: number;
  totalAdmins: number;
  totalUsers: number;
  totalEventos: number;
  eventosProximos: number;
  ventasHoy: number;
}

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
  stats = signal<DashboardStats>({
    totalUsuarios: 0,
    totalAdmins: 0,
    totalUsers: 0,
    totalEventos: 0,
    eventosProximos: 0,
    ventasHoy: 0
  });
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.usuariosService.getAllUsers().subscribe({
      next: (users) => {
        // Calcular estadísticas reales
        const totalAdmins = users.filter(u => u.role === 'admin').length;
        const totalUsers = users.filter(u => u.role === 'user').length;
        
        this.stats.set({
          totalUsuarios: users.length,
          totalAdmins: totalAdmins,
          totalUsers: totalUsers,
          totalEventos: 0, 
          eventosProximos: 0,
          ventasHoy: 0 
        });
        
        this.loading.set(false);
        console.log(' Estadísticas cargadas:', this.stats());
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error.set('No se pudieron cargar las estadísticas');
        this.loading.set(false);
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Método para recargar datos
  refreshData(): void {
    this.loadDashboardData();
  }
}