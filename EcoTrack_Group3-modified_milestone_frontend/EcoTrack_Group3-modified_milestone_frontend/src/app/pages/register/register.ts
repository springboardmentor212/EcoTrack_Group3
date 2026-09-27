import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  nameError = '';
  emailError = '';
  passwordErrors: string[] = [];
  confirmPasswordError = '';

  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // =========================
  // SHOW / HIDE PASSWORD
  // =========================

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // =========================
  // NAME VALIDATION
  // =========================

  validateName(): void {

    this.nameError = '';

    const name = this.name.trim();

    if (name === '') {
      this.nameError = 'Full name is required.';
      return;
    }

    if (name.length < 3) {
      this.nameError = 'Name must contain at least 3 characters.';
      return;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
      this.nameError =
        'Name can contain only letters and spaces.';
      return;
    }
  }

  // =========================
  // EMAIL VALIDATION
  // =========================

  validateEmail(): void {

    this.emailError = '';

    const email = this.email.trim();

    if (email === '') {
      this.emailError = 'Email address is required.';
      return;
    }

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailPattern.test(email)) {
      this.emailError =
        'Please enter a valid Gmail address.';
      return;
    }
  }

  // =========================
  // PASSWORD VALIDATION
  // =========================

  validatePassword(): void {

    this.passwordErrors = [];

    const password = this.password;

    if (password.length < 8) {
      this.passwordErrors.push(
        'Password must contain at least 8 characters.'
      );
    }

    if (!/[A-Z]/.test(password)) {
      this.passwordErrors.push(
        'Password must contain at least one capital letter.'
      );
    }

    if (!/[0-9]/.test(password)) {
      this.passwordErrors.push(
        'Password must contain at least one number.'
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
      this.passwordErrors.push(
        'Password must contain at least one special character.'
      );
    }

    if (this.confirmPassword !== '') {
      this.validateConfirmPassword();
    }
  }

  // =========================
  // CONFIRM PASSWORD
  // =========================

  validateConfirmPassword(): void {

    this.confirmPasswordError = '';

    if (this.confirmPassword === '') {
      this.confirmPasswordError =
        'Please confirm your password.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError =
        'Passwords do not match.';
      return;
    }
  }

  // =========================
  // REGISTER
  // =========================

  register(): void {

    // Run all validations
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();

    // Stop if validation failed
    if (
      this.nameError !== '' ||
      this.emailError !== '' ||
      this.passwordErrors.length > 0 ||
      this.confirmPasswordError !== ''
    ) {
      return;
    }

    // Prevent multiple clicks
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    // Send registration data to backend
    this.authService.register(
      this.name.trim(),
      this.email.trim(),
      this.password
    ).subscribe({

      // =========================
      // SUCCESS
      // =========================

      next: (response) => {

        this.isLoading = false;

        console.log(
          'Registration successful:',
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

        } else {

          // Fallback if backend doesn't return user
          const user = {
            name: this.name.trim(),
            email: this.email.trim()
          };

          localStorage.setItem(
            'ecotrack_user',
            JSON.stringify(user)
          );
        }

        alert(
          'Account created successfully!'
        );

        // Go to dashboard
        this.router.navigate(['/dashboard']);
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {

        this.isLoading = false;

        console.error(
          'Registration failed:',
          error
        );

        const message =
          error?.error?.message ||
          'Registration failed. Please try again.';

        alert(message);
      }

    });
  }
}