import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenges.html',
  styleUrls: ['./challenges.css']
})
export class AdminChallenges implements OnInit {

  challenges: any[] = [];
  searchText = '';
  statusFilter ='all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadChallenges();
  }
  get activeCount(): number {
  return this.challenges.filter(c => !c.completed).length;
}

get completedCount(): number {
  return this.challenges.filter(c => c.completed).length;
}

get filteredChallenges(): any[] {
  const query = this.searchText.trim().toLowerCase();

  return this.challenges.filter(challenge => {
    const matchesSearch =
      (challenge.title || '').toLowerCase().includes(query) ||
      (challenge.userId?.name || '').toLowerCase().includes(query) ||
      (challenge.userId?.email || '').toLowerCase().includes(query);

    const matchesStatus =
      this.statusFilter === 'all' ||
      (this.statusFilter === 'completed' && challenge.completed) ||
      (this.statusFilter === 'active' && !challenge.completed);

    return matchesSearch && matchesStatus;
  });
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