import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Goal {
  id: number;
  title: string;
  target: string;
  deadline: string;
  progress: number;
  completed: boolean;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  RouterLink
],
  templateUrl: './goals.html',
  styleUrl: './goals.css'
})
export class Goals implements OnInit {

  goals: Goal[] = [];

  showAddGoal = false;

  newGoal = {
    title: '',
    target: '',
    deadline: '',
    progress: 0
  };


  ngOnInit(): void {
    this.loadGoals();
  }


  /* ================================
     LOAD GOALS
  ================================= */

  private loadGoals(): void {

    const saved =
      localStorage.getItem('ecotrack_goals');

    if (!saved) {

      this.goals = [
        {
          id: 1,
          title: 'Reduce car usage by 50%',
          target: 'Target: 240 km',
          deadline: 'Oct 31, 2026',
          progress: 60,
          completed: false
        },
        {
          id: 2,
          title: 'Go completely plastic-free',
          target: 'Target: 7 days',
          deadline: 'Oct 20, 2026',
          progress: 85,
          completed: false
        },
        {
          id: 3,
          title: 'Plant 10 indigenous trees',
          target: 'Target: 10 trees',
          deadline: 'Dec 15, 2026',
          progress: 40,
          completed: false
        }
      ];

      this.saveGoals();

      return;
    }


    try {

      this.goals = JSON.parse(saved);

    } catch {

      this.goals = [];

    }

  }


  /* ================================
     SAVE GOALS
  ================================= */

  private saveGoals(): void {

    localStorage.setItem(
      'ecotrack_goals',
      JSON.stringify(this.goals)
    );

  }


  /* ================================
     ADD GOAL
  ================================= */

  openAddGoal(): void {

    this.showAddGoal = true;

  }


  closeAddGoal(): void {

    this.showAddGoal = false;

    this.resetForm();

  }


  addGoal(): void {

    if (
      !this.newGoal.title.trim() ||
      !this.newGoal.target.trim() ||
      !this.newGoal.deadline
    ) {

      return;

    }


    const goal: Goal = {

      id: Date.now(),

      title:
        this.newGoal.title.trim(),

      target:
        this.newGoal.target.trim(),

      deadline:
        this.formatDeadline(
          this.newGoal.deadline
        ),

      progress:
        Number(this.newGoal.progress) || 0,

      completed:
        Number(this.newGoal.progress) >= 100

    };


    this.goals.push(goal);

    this.saveGoals();

    this.closeAddGoal();

  }


  /* ================================
     UPDATE PROGRESS
  ================================= */

  increaseProgress(goal: Goal): void {

    if (goal.progress >= 100) {
      return;
    }

    goal.progress =
      Math.min(
        goal.progress + 10,
        100
      );

    goal.completed =
      goal.progress >= 100;

    this.saveGoals();

  }


  decreaseProgress(goal: Goal): void {

    if (goal.progress <= 0) {
      return;
    }

    goal.progress =
      Math.max(
        goal.progress - 10,
        0
      );

    goal.completed = false;

    this.saveGoals();

  }


  /* ================================
     DELETE GOAL
  ================================= */

  deleteGoal(id: number): void {

    this.goals =
      this.goals.filter(
        goal => goal.id !== id
      );

    this.saveGoals();

  }


  /* ================================
     COMPLETED GOALS
  ================================= */

  get completedGoals(): Goal[] {

    return this.goals.filter(
      goal => goal.completed
    );

  }


  /* ================================
     ACTIVE GOALS
  ================================= */

  get activeGoals(): Goal[] {

    return this.goals.filter(
      goal => !goal.completed
    );

  }


  /* ================================
     DATE
  ================================= */

  private formatDeadline(
    date: string
  ): string {

    const selectedDate =
      new Date(date + 'T00:00:00');


    return selectedDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );

  }


  /* ================================
     RESET FORM
  ================================= */

  private resetForm(): void {

    this.newGoal = {
      title: '',
      target: '',
      deadline: '',
      progress: 0
    };

  }

}