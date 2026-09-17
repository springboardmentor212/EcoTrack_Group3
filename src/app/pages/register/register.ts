import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}


  // =========================================
  // SHOW / HIDE PASSWORD
  // =========================================

  togglePassword() {

    this.showPassword =
      !this.showPassword;

  }


  toggleConfirmPassword() {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }


  // =========================================
  // NAME VALIDATION
  // =========================================

  validateName() {

    this.nameError = '';

    const name = this.name.trim();


    if (name === '') {

      this.nameError =
        'Full name is required.';

      return;
    }


    if (name.length < 3) {

      this.nameError =
        'Name must contain at least 3 characters.';

      return;
    }


    if (!/^[A-Za-z ]+$/.test(name)) {

      this.nameError =
        'Name can contain only letters and spaces.';

      return;
    }

  }


  // =========================================
  // EMAIL VALIDATION
  // =========================================

  validateEmail() {

    this.emailError = '';

    const email = this.email.trim();


    if (email === '') {

      this.emailError =
        'Email address is required.';

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


  // =========================================
  // PASSWORD VALIDATION
  // =========================================

  validatePassword() {

    this.passwordErrors = [];

    const password = this.password;


    // At least 8 characters

    if (password.length < 8) {

      this.passwordErrors.push(
        'Password must contain at least 8 characters.'
      );

    }


    // At least one capital letter

    if (!/[A-Z]/.test(password)) {

      this.passwordErrors.push(
        'Password must contain at least one capital letter.'
      );

    }


    // At least one number

    if (!/[0-9]/.test(password)) {

      this.passwordErrors.push(
        'Password must contain at least one number.'
      );

    }


    // At least one special character

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {

      this.passwordErrors.push(
        'Password must contain at least one special character.'
      );

    }


   
    


    // If confirm password has already been entered,
    // check it again.

    if (this.confirmPassword !== '') {

      this.validateConfirmPassword();

    }

  }


  // =========================================
  // CONFIRM PASSWORD VALIDATION
  // =========================================

  validateConfirmPassword() {

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


  // =========================================
  // CREATE ACCOUNT
  // =========================================

  register() {

    // Run all validations first

    this.validateName();

    this.validateEmail();

    this.validatePassword();

    this.validateConfirmPassword();


    // =========================================
    // STOP IF ANYTHING IS INVALID
    // =========================================

    if (
      this.nameError !== '' ||
      this.emailError !== '' ||
      this.passwordErrors.length > 0 ||
      this.confirmPasswordError !== ''
    ) {

      return;

    }


    // =========================================
    // CREATE ACCOUNT
    // =========================================

    const account = {

      name: this.name.trim(),

      email: this.email.trim(),

      password: this.password

    };


    // Save account in browser

    localStorage.setItem(
      'ecotrack_account',
      JSON.stringify(account)
    );


    // =========================================
    // ACCOUNT CREATED SUCCESSFULLY
    // =========================================

    alert(
      'Account created successfully!'
    );


    // Go to Dashboard

    this.router.navigate(['/dashboard']);

  }

}