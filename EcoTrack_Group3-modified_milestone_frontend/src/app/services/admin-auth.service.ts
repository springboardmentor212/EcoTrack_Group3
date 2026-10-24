import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  private tokenKey = 'ecotrack_admin_token';
  private adminKey = 'ecotrack_admin_user';

  private apiUrl = 'http://localhost:5000/api/admin/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveAdmin(admin: any): void {
    localStorage.setItem(
      this.adminKey,
      JSON.stringify(admin)
    );
  }

  getAdmin(): any {
    const admin = localStorage.getItem(this.adminKey);

    return admin
      ? JSON.parse(admin)
      : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey);
  }
}