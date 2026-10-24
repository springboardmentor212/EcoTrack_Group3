import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class AdminReports implements OnInit {
  totalUsers = 0;
  totalChallenges = 0;
  completedChallenges = 0;
  activeChallenges = 0;
  completionRate = 0;
  loading = true;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.http.get<any>('http://localhost:5000/api/admin/users')
      .subscribe({
        next: (response) => {
          const users = Array.isArray(response)
            ? response
            : response?.data || response?.users || response?.challenges || [];

          this.totalUsers = users.length;

          this.http.get<any>('http://localhost:5000/api/admin/challenges')
            .subscribe({
              next: (challengeResponse) => {
                const challenges = Array.isArray(challengeResponse)
                  ? challengeResponse
                  : challengeResponse?.challenges || [];

                this.totalChallenges = challenges.length;
                this.completedChallenges = challenges.filter(
                  (challenge: any) => challenge.completed === true
                ).length;

                this.activeChallenges =
                  this.totalChallenges - this.completedChallenges;

                this.completionRate = this.totalChallenges
                  ? Math.round(
                      (this.completedChallenges / this.totalChallenges) * 100
                    )
                  : 0;

                this.loading = false;
              },
              error: () => {
                this.errorMessage = 'Unable to load challenge report data.';
                this.loading = false;
              }
            });
        },
        error: () => {
          this.errorMessage = 'Unable to load user report data.';
          this.loading = false;
        }
      });
  }

  downloadReport(): void {
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.setTextColor(11, 93, 42);
  pdf.text('EcoTrack Admin Report', 20, 25);

  pdf.setFontSize(11);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Generated At: ${new Date().toLocaleString()}`, 20, 38);

  pdf.setDrawColor(54, 148, 90);
  pdf.line(20, 45, 190, 45);

  pdf.setFontSize(14);
  pdf.setTextColor(30, 50, 35);
  pdf.text('Summary', 20, 58);

  pdf.setFontSize(12);
  const rows = [
    `Total Users: ${this.totalUsers}`,
    `Total Challenges: ${this.totalChallenges}`,
    `Active Challenges: ${this.activeChallenges}`,
    `Completed Challenges: ${this.completedChallenges}`,
    `Completion Rate: ${this.completionRate}%`
  ];

  let y = 72;

  rows.forEach((row) => {
    pdf.text(row, 25, y);
    y += 12;
  });

  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text('EcoTrack - Environmental Activity Tracking', 20, 280);

  pdf.save('EcoTrack-Admin-Report.pdf');
}
}