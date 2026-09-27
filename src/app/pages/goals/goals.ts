import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Goal {
  id: number;
  title: string;
  type: string;
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

  /* ================================
     EDIT GOAL
  ================================= */

  showEditGoal = false;

  editGoal: Goal = {
    id: 0,
    title: '',
    type: '',
    target: '',
    deadline: '',
    progress: 0,
    completed: false
  };


  /* ================================
     NEW GOAL
  ================================= */

  newGoal = {
    title: '',
    type: '',
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
          type: 'Reduce Carbon Emissions',
          target: 'Target: 240 km',
          deadline: 'Oct 31, 2026',
          progress: 60,
          completed: false
        },
        {
          id: 2,
          title: 'Go completely plastic-free',
          type: 'Reduce Plastic Usage',
          target: 'Target: 7 days',
          deadline: 'Oct 20, 2026',
          progress: 85,
          completed: false
        },
        {
          id: 3,
          title: 'Plant 10 indigenous trees',
          type: 'Plant Trees',
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

      /*
       * Older goals may not have a type because they were
       * created before Goal Type was added.
       */
      this.goals = this.goals.map(goal => ({
        ...goal,
        type: goal.type || ''
      }));

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

      type:
        this.newGoal.type,

      target:
        this.newGoal.target.trim(),

      deadline:
        this.formatDeadline(
          this.newGoal.deadline
        ),

      progress:
        Math.min(
          Math.max(
            Number(this.newGoal.progress) || 0,
            0
          ),
          100
        ),

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
     GOAL ANALYTICS
  ================================= */

  get totalGoals(): number {

    return this.goals.length;

  }


  get averageProgress(): number {

    if (this.goals.length === 0) {
      return 0;
    }

    const total =
      this.goals.reduce(
        (sum, goal) =>
          sum + goal.progress,
        0
      );

    return Math.round(
      total / this.goals.length
    );

  }


  /* ================================
     EDIT GOAL
  ================================= */

  openEditGoal(goal: Goal): void {

    this.editGoal = {
      ...goal
    };

    /*
     * The displayed deadline is like:
     * "Sep 17, 2026"
     *
     * Convert it to:
     * "2026-09-17"
     *
     * so the HTML date input can display it.
     */
    this.editGoal.deadline =
      this.convertDeadlineToInput(
        goal.deadline
      );

    this.showEditGoal = true;

  }


  closeEditGoal(): void {

    this.showEditGoal = false;

  }


  updateGoal(): void {

    if (
      !this.editGoal.title.trim() ||
      !this.editGoal.target.trim() ||
      !this.editGoal.deadline
    ) {

      return;

    }


    const index =
      this.goals.findIndex(
        goal =>
          goal.id === this.editGoal.id
      );


    if (index === -1) {
      return;
    }


    const updatedProgress =
      Math.min(
        Math.max(
          Number(this.editGoal.progress) || 0,
          0
        ),
        100
      );


    this.goals[index] = {

      ...this.editGoal,

      title:
        this.editGoal.title.trim(),

      type:
        this.editGoal.type || '',

      target:
        this.editGoal.target.trim(),

      deadline:
        this.formatDeadline(
          this.editGoal.deadline
        ),

      progress:
        updatedProgress,

      completed:
        updatedProgress >= 100

    };


    this.saveGoals();

    this.closeEditGoal();

  }


  /* ================================
     DATE
  ================================= */

  private formatDeadline(
    date: string
  ): string {

    const selectedDate =
      new Date(
        date + 'T00:00:00'
      );


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
     CONVERT DISPLAY DATE
     TO HTML DATE INPUT
  ================================= */

  private convertDeadlineToInput(
    deadline: string
  ): string {

    /*
     * If it is already in YYYY-MM-DD format,
     * return it directly.
     */
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        deadline
      )
    ) {

      return deadline;

    }


    const date =
      new Date(deadline);


    if (isNaN(date.getTime())) {

      return '';

    }


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        date.getDate()
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;

  }


  /* ================================
     RESET FORM
  ================================= */

  private resetForm(): void {

    this.newGoal = {

      title: '',

      type: '',

      target: '',

      deadline: '',

      progress: 0

    };

  }

}