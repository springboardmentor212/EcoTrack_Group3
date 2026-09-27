import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Challenge {
  completed: boolean;
  progress: number;
  percentage: number;
  points: number;
}

@Component({
  selector: 'app-challenges',
  imports: [CommonModule],
  templateUrl: './challenges.html',
  styleUrl: './challenges.css'
})
export class Challenges {

  currentStreak = 7;
  activeTab: string = 'all';

  private readonly storageKey = 'ecotrack_challenges';

  challenges: Challenge[] = [
    {
      completed: true,
      progress: 5000,
      percentage: 100,
      points: 20
    },
    {
      completed: true,
      progress: 2,
      percentage: 100,
      points: 20
    },
    {
      completed: false,
      progress: 0,
      percentage: 0,
      points: 30
    }
  ];

  constructor(private router: Router) {
    this.loadChallenges();
  }


  // Load saved challenges
  private loadChallenges(): void {

    const savedChallenges =
      localStorage.getItem(this.storageKey);

    if (!savedChallenges) {
      return;
    }

    try {

      const saved = JSON.parse(savedChallenges);

      if (Array.isArray(saved) && saved.length === this.challenges.length) {

        this.challenges = saved.map(
          (challenge: Challenge) => ({
            completed: challenge.completed,
            progress: challenge.progress,
            percentage: challenge.percentage,
            points: challenge.points
          })
        );

      }

    } catch {
      // Keep the default challenges if saved data is invalid
    }
  }


  // Save challenges
  private saveChallenges(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.challenges)
    );
  }


  get completedCount(): number {
    return this.challenges.filter(
      challenge => challenge.completed
    ).length;
  }


  get rewardUnlocked(): boolean {
    return this.completedCount === 3;
  }


  get earnedPoints(): number {

    const challengePoints =
      this.challenges
        .filter(challenge => challenge.completed)
        .reduce(
          (total, challenge) =>
            total + challenge.points,
          0
        );

    const bonusPoints =
      this.rewardUnlocked ? 50 : 0;

    return challengePoints + bonusPoints;
  }


  get overallProgress(): number {

    return Math.round(
      (this.completedCount / this.challenges.length) * 100
    );

  }


  isChallengeVisible(index: number): boolean {

    const challenge = this.challenges[index];

    if (this.activeTab === 'all') {
      return true;
    }

    if (this.activeTab === 'active') {
      return !challenge.completed;
    }

    if (this.activeTab === 'completed') {
      return challenge.completed;
    }

    return true;
  }


  completeChallenge(index: number): void {

    const challenge = this.challenges[index];

    if (challenge.completed) {

      challenge.completed = false;
      challenge.percentage = 0;
      challenge.progress = 0;

    } else {

      challenge.completed = true;
      challenge.percentage = 100;

      if (index === 0) {
        challenge.progress = 5000;
      }

      if (index === 1) {
        challenge.progress = 2;
      }

      if (index === 2) {
        challenge.progress = 1;
      }
    }


    // Save immediately whenever challenge status changes
    this.saveChallenges();


    // Keep the existing reward navigation
    if (this.completedCount === 3) {
      this.router.navigate(['/rewards']);
    }
  }
}