import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {

  newPassword = '';
  confirmPassword = '';

  showNewPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  resetToken = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';

      console.log('Reset token:', this.resetToken);
    });
  }

  async resetPassword(): Promise<void> {

    this.errorMessage = '';

    // Check token
    if (!this.resetToken) {
      this.errorMessage = 'Invalid or missing reset link.';
      return;
    }

    // Check passwords
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in both password fields.';
      return;
    }

    // Minimum password length
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    // Check whether passwords match
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    try {

      console.log('Sending password reset request...');

      const response = await fetch(
        'http://localhost:5000/api/auth/reset-password',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            token: this.resetToken,
            password: this.newPassword
          })
        }
      );

      const data = await response.json();

      console.log('Reset password response:', data);

      if (data.success) {

        alert('Password has been reset successfully!');

        // Go back to login
        this.router.navigate(['/']);

      } else {

        this.errorMessage =
          data.message || 'Password reset failed.';
      }

    } catch (error) {

      console.error('Reset password error:', error);

      this.errorMessage =
        'Cannot connect to the backend.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }
}