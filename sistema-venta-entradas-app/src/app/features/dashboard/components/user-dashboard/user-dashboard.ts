import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Compras } from '../../../compras/services/compras';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit {
  private authService = inject(Auth);
  private comprasService = inject(Compras);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  estadisticas = signal({
    totalCompras: 0,
    comprasPendientes: 0,
    comprasPagadas: 0,
    comprasCanceladas: 0,
    totalGastado: 0
  });
  loading = signal(true);

  ngOnInit(): void {
    this.loadUserData();
    this.loadEstadisticas();
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
  }

  loadEstadisticas(): void {
    this.loading.set(true);
    
    this.comprasService.getMisCompras().subscribe({
      next: (compras) => {
        const stats = {
          totalCompras: compras.length,
          comprasPendientes: compras.filter(c => c.estado === 'pendiente').length,
          comprasPagadas: compras.filter(c => c.estado === 'pagado').length,
          comprasCanceladas: compras.filter(c => c.estado === 'cancelado').length,
          totalGastado: compras
            .filter(c => c.estado === 'pagado')
            .reduce((sum, c) => sum + c.total, 0)
        };
        
        this.estadisticas.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.loading.set(false);
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB'
    }).format(precio);
  }

  getSaludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}