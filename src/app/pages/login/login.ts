import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  showPassword = false;

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login(email: string, password: string) {

    email = email.trim();

    if (email === '') {
      alert('Please enter your email.');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailPattern.test(email)) {
      alert('Please enter a valid Gmail address.');
      return;
    }

    if (password === '') {
      alert('Please enter your password.');
      return;
    }

    if (password.length < 8) {
      alert('Password must contain at least 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert('Password must contain at least one capital letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      alert('Password must contain at least one number.');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
      alert('Password must contain at least one special character.');
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}