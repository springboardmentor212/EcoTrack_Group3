import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.html',
  styleUrl: '../../login/login.css'
})
export class AdminLogin {

  showPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(
    email: string,
    password: string
  ): void {

    email = email.trim();

    if (email === '') {
      alert('Please enter your email.');
      return;
    }

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (password === '') {
      alert('Please enter your password.');
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.adminAuthService.login(
      email,
      password
    ).subscribe({

      next: (response) => {

        this.isLoading = false;

        if (response.token) {
          this.adminAuthService.saveToken(
            response.token
          );
        }

        if (response.admin) {
          this.adminAuthService.saveAdmin(
            response.admin
          );
        }

        this.router.navigate([
          '/admin/users'
        ]);
      },

      error: (error) => {

        this.isLoading = false;

        console.error(
          'Admin login failed:',
          error
        );

        const message =
          error?.error?.message ||
          'Admin login failed. Please check your credentials.';

        alert(message);
      }

    });
  }
}