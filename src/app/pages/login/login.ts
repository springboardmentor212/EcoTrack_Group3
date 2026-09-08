
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
showPassword=false;
  togglePassword(){
    this.showPassword=!this.showPassword;
  }
  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/dashboard']);
  }
}
