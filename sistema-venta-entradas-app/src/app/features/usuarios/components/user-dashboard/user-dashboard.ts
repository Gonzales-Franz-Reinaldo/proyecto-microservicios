import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Usuarios } from '../../services/usuarios';
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
  private usuariosService = inject(Usuarios);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading.set(true);
    this.usuariosService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  navigateToEvents(): void {
    // TODO: Implementar cuando esté el módulo de eventos
    alert('Módulo de eventos próximamente');
  }

  navigateToMyPurchases(): void {
    // TODO: Implementar cuando esté el módulo de compras
    alert('Módulo de compras próximamente');
  }
}