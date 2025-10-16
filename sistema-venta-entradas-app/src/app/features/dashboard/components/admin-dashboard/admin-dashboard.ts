import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Usuarios } from '../../../usuarios/services/usuarios';
import { Eventos } from '../../../eventos/services/eventos'; 
import { User } from '../../../../core/models/user';

interface DashboardStats {
  totalUsuarios: number;
  totalAdmins: number;
  totalUsers: number;
  totalEventos: number;
  eventosProximos: number;
  eventosPasados: number;
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
  private eventosService = inject(Eventos); 
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  stats = signal<DashboardStats>({
    totalUsuarios: 0,
    totalAdmins: 0,
    totalUsers: 0,
    totalEventos: 0,
    eventosProximos: 0,
    eventosPasados: 0,
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
    
    // Cargar usuarios Y eventos en paralelo
    Promise.all([
      this.usuariosService.getAllUsers().toPromise(),
      this.eventosService.getAllEventos().toPromise()
    ]).then(([users, eventos]) => {
      // Estadísticas de usuarios
      const totalAdmins = users?.filter(u => u.role === 'admin').length || 0;
      const totalUsers = users?.filter(u => u.role === 'user').length || 0;
      
      // Estadísticas de eventos
      const now = new Date();
      const eventosProximos = eventos?.filter(e => new Date(e.fecha) >= now).length || 0;
      const eventosPasados = eventos?.filter(e => new Date(e.fecha) < now).length || 0;
      
      this.stats.set({
        totalUsuarios: users?.length || 0,
        totalAdmins,
        totalUsers,
        totalEventos: eventos?.length || 0,
        eventosProximos,
        eventosPasados,
        ventasHoy: 0 // TODO: Implementar cuando tengas el servicio de ventas
      });
      
      this.loading.set(false);
      console.log('Estadísticas cargadas:', this.stats());
    }).catch((err) => {
      console.error(' Error al cargar estadísticas:', err);
      this.error.set('No se pudieron cargar las estadísticas');
      this.loading.set(false);
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}