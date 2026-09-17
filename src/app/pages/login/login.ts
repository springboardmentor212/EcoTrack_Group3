import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  showPassword = false;

  constructor(
    private router: Router
  ) {}


  // =========================================
  // SHOW / HIDE PASSWORD
  // =========================================

  togglePassword() {

    this.showPassword =
      !this.showPassword;

  }


  // =========================================
  // LOGIN
  // =========================================

  login(
    emailInput: HTMLInputElement,
    passwordInput: HTMLInputElement
  ) {

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    // =========================================
    // CHECK EMAIL FIRST
    // =========================================

    if (email === '') {

      alert(
        'Please enter your email address.'
      );

      // Focus email box
      emailInput.focus();

      return;
    }


    // =========================================
    // CHECK GMAIL
    // =========================================

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


    if (!emailPattern.test(email)) {

      alert(
        'Please enter a valid Gmail address.'
      );

      emailInput.focus();

      return;
    }


    // =========================================
    // CHECK PASSWORD
    // =========================================

    if (password === '') {

      alert(
        'Please enter your password.'
      );

      // Focus password box
      passwordInput.focus();

      return;
    }


    // =========================================
    // PASSWORD VALIDATION
    // =========================================

    const errors: string[] = [];


    // At least 8 characters

    if (password.length < 8) {

      errors.push(
        'Password must contain at least 8 characters.'
      );

    }


    // At least one capital letter

    if (!/[A-Z]/.test(password)) {

      errors.push(
        'Password must contain at least one capital letter.'
      );

    }


    // At least one number

    if (!/[0-9]/.test(password)) {

      errors.push(
        'Password must contain at least one number.'
      );

    }


    // At least one special character

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {

      errors.push(
        'Password must contain at least one special character.'
      );

    }


    // =========================================
    // SHOW PASSWORD ERRORS
    // =========================================

    if (errors.length > 0) {

      alert(
        'Please fix the following:\n\n• ' +
        errors.join('\n• ')
      );

      // Clear password after alert
      passwordInput.value = '';

      // Focus password box
      passwordInput.focus();

      return;
    }


    // =========================================
    // GET REGISTERED ACCOUNT
    // =========================================

    const savedAccount =
      localStorage.getItem('ecotrack_account');


    // =========================================
    // NO ACCOUNT FOUND
    // =========================================

    if (!savedAccount) {

      alert(
        'No account found. Please create an account first.'
      );

      passwordInput.value = '';

      emailInput.focus();

      return;
    }


    // Convert saved account back to object

    const account =
      JSON.parse(savedAccount);


    // =========================================
    // CHECK EMAIL AND PASSWORD
    // =========================================

    if (
      email !== account.email ||
      password !== account.password
    ) {

      alert(
        'Invalid email or password.'
      );

      passwordInput.value = '';

      passwordInput.focus();

      return;
    }


    // =========================================
    // LOGIN SUCCESSFUL
    // =========================================

    alert(
      'Login successful!'
    );


    // Go to dashboard

    this.router.navigate([
      '/dashboard'
    ]);

  }

}