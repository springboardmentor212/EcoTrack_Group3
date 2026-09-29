import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  showPassword = false;

  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // =========================
  // SHOW / HIDE PASSWORD
  // =========================

  togglePassword(): void {
    this.showPassword =
      !this.showPassword;
  }

  // =========================
  // LOGIN
  // =========================

  login(
    email: string,
    password: string
  ): void {

    email = email.trim();

    // =========================
    // EMAIL VALIDATION
    // =========================

    if (email === '') {

      alert(
        'Please enter your email.'
      );

      return;
    }

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailPattern.test(email)) {

      alert(
        'Please enter a valid Gmail address.'
      );

      return;
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (password === '') {

      alert(
        'Please enter your password.'
      );

      return;
    }

    if (password.length < 8) {

      alert(
        'Password must contain at least 8 characters.'
      );

      return;
    }

    if (!/[A-Z]/.test(password)) {

      alert(
        'Password must contain at least one capital letter.'
      );

      return;
    }

    if (!/[0-9]/.test(password)) {

      alert(
        'Password must contain at least one number.'
      );

      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {

      alert(
        'Password must contain at least one special character.'
      );

      return;
    }

    // =========================
    // PREVENT MULTIPLE LOGIN
    // =========================

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    // =========================
    // CALL BACKEND LOGIN API
    // =========================

    this.authService.login(
      email,
      password
    ).subscribe({

      // =========================
      // LOGIN SUCCESS
      // =========================

      next: (response) => {

        this.isLoading = false;

        console.log(
          'Login successful:',
          response
        );

        // Save JWT token
        if (response.token) {

          this.authService.saveToken(
            response.token
          );
        }

        // Save logged-in user's information
        if (response.user) {

          localStorage.setItem(
            'ecotrack_user',
            JSON.stringify(response.user)
          );

        }

        // Go to dashboard
        this.router.navigate([
          '/dashboard'
        ]);
      },

      // =========================
      // LOGIN ERROR
      // =========================

      error: (error) => {

        this.isLoading = false;

        console.error(
          'Login failed:',
          error
        );

        const message =
          error?.error?.message ||
          'Login failed. Please check your email and password.';

        alert(message);
      }

    });
  }
}