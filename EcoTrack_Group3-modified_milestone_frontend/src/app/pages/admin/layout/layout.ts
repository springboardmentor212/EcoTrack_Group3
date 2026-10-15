import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class AdminLayout {

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService
  ) {}

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }
}