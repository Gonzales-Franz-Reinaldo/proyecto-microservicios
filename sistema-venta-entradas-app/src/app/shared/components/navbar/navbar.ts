import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private authService = inject(Auth);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  isMenuOpen = signal(false);

  constructor() {
    // Suscribirse a cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen.update(val => !val);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.closeMenu();
    }
  }

  navigateToProfile(): void {
    const user = this.currentUser();
    if (user?.role === 'admin') {
      this.router.navigate(['/dashboard/admin/perfil']); 
    } else {
      this.router.navigate(['/dashboard/user/perfil']);
    }
    this.closeMenu();
  }

  get isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  get isUser(): boolean {
    return this.currentUser()?.role === 'user';
  }

  get isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}