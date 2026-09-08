import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [FormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register{
  name='';
  email='';
  password='';
  confirmPassword='';
  showConfirmPassword= false;
  showPassword=false;
  togglePassword(){
    this.showPassword=!this.showPassword;
  }
  toggleConfirmPassword(){
    this.showConfirmPassword=!this.showConfirmPassword;
  }

 constructor(private router: Router) {}

  register() {
    this.router.navigate(['/login']);
  }
}