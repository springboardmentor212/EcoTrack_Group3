import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule,CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
newPassword='';
confirmPassword='';
errorMessage='';
resetPassword(){
  if(this.newPassword!== this.confirmPassword){
    this.errorMessage='password must be at least 8 characters.'
    return;
  }
}
goToLogin(){
  console.log('Password reset successful');
}
}
