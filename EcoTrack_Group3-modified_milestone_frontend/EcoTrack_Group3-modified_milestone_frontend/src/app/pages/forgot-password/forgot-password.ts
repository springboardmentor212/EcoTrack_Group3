import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  constructor(private router: Router) {}

  async resetPassword(email: string): Promise<void> {

    email = email.trim();

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    // Your EcoTrack frontend currently requires Gmail addresses
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailPattern.test(email)) {
      alert('Please enter a valid Gmail address.');
      return;
    }

    try {

      const response = await fetch(
        'http://localhost:5000/api/auth/forgot-password',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      console.log('Forgot password response:', data);

      if (data.success) {

        alert(
          'Password reset link has been sent to your email. Please check your Gmail inbox.'
        );

      } else {

        alert(
          data.message || 'Unable to send password reset link.'
        );
      }

    } catch (error) {

      console.error('Forgot password error:', error);

      alert(
        'Cannot connect to the backend. Please make sure the backend is running.'
      );
    }
  }
}