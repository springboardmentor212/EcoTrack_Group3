
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  // =========================
  // CHALLENGE TAB
  // =========================
  activeTab: string = 'all';

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


  get completedCount(): number {
    return this.challenges.filter(
      challenge => challenge.completed
    ).length;
  }


  get earnedPoints(): number {
    return this.challenges
      .filter(challenge => challenge.completed)
      .reduce(
        (total, challenge) => total + challenge.points,
        0
      );
  }


  get overallProgress(): number {
    return Math.round(
      (this.completedCount / this.challenges.length) * 100
    );
  }


  // =========================
  // TAB FILTER
  // =========================
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

      if (index === 0) {
        challenge.progress = 0;
      }

      if (index === 1) {
        challenge.progress = 0;
      }

      if (index === 2) {
        challenge.progress = 0;
      }

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

  }

}

