import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {

  resetPassword(email: string): void {

    // Remove extra spaces from the beginning and end
    email = email.trim();

    // Check if the email field is empty
    if (email === '') {
      alert('Please enter your email address.');
      return;
    }

    // Check whether the email format is valid
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // For now, only frontend validation is implemented.
    // Backend password-reset integration will be added next.
    alert('Email address is valid. We can now proceed with password reset.');
  }
}