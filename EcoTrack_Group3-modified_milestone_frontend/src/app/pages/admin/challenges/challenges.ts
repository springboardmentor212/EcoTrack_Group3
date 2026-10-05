import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-challenges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenges.html',
  styleUrls: ['./challenges.css']
})
export class AdminChallenges implements OnInit {

  challenges: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.http.get<any>('http://localhost:5000/api/admin/challenges')
      .subscribe({
        next: (response) => {
          this.challenges = response.data;
        },
        error: (error) => {
          console.error('Failed to load challenges:', error);
        }
      });
  }
}