import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(
    name: string,
    email: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/register`,
      {
        name,
        email,
        password
      }
    );
  }

  login(
    email: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    );
  }

  getProfile(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/profile`
    );
  }

  forgotPassword(
    email: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      {
        email
      }
    );
  }

  resetPassword(
    token: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/reset-password`,
      {
        token,
        password
      }
    );
  }

  saveToken(
    token: string
  ): void {

    localStorage.setItem(
      'ecotrack_token',
      token
    );
  }

  getToken(): string | null {

    return localStorage.getItem(
      'ecotrack_token'
    );
  }

  saveUser(
    user: any
  ): void {

    localStorage.setItem(
      'ecotrack_user',
      JSON.stringify(user)
    );
  }

  getUser(): any {

    const user =
      localStorage.getItem(
        'ecotrack_user'
      );

    if (!user) {
      return null;
    }

    try {

      return JSON.parse(user);

    } catch {

      return null;

    }
  }

  logout(): void {

    localStorage.removeItem(
      'ecotrack_token'
    );

    localStorage.removeItem(
      'ecotrack_user'
    );
  }

  isLoggedIn(): boolean {

    return !!this.getToken();

  }
}