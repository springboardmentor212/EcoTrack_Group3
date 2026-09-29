
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {

  constructor(private router: Router) {}

  resetPassword(): void {

    alert(
      'Password reset link has been sent to your email!'
    );

    this.router.navigate(['/']);
  }

}
