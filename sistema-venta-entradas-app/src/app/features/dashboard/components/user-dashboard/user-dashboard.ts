import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
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
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    setTimeout(() => this.loading.set(false), 800);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}