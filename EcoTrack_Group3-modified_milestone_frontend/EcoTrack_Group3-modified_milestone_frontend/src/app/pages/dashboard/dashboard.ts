import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';

import {
  Activity,
  ActivityService
} from '../../services/activity.service';

import { CarbonService }
  from '../../services/carbon.service';

import { AuthService }
  from '../../services/auth.service';


interface LeaderboardMember {
  name: string;
  avatar: string;
  steps: number;
  activities: number;
  points: number;
  rank: number;
  you?: boolean;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})


export class Dashboard implements OnInit, OnDestroy {

  userName = 'User';
  userEmail = '';

  currentUserPoints = 0;
  currentUserRank = 1;

  activities: Activity[] = [];

  totalMinutes = 0;
  totalCalories = 0;
  activityCount = 0;

  totalCarbon = 0;

  totalGoals = 0;
  completedGoals = 0;

  leaderboard: LeaderboardMember[] = [];

  private activitySubscription?: Subscription;
  private carbonSubscription?: Subscription;


  constructor(
    private activityService: ActivityService,
    private carbonService: CarbonService,
    private authService: AuthService,
    private router: Router
  ) {}


  // =========================
  // PAGE INITIALIZATION
  // =========================

  ngOnInit(): void {

    const user = this.authService.getUser();

    if (user) {

      this.userName =
        user.name || 'User';

      this.userEmail =
        user.email || '';

      this.currentUserPoints =
        Number(user.totalPoints || 0);
    }


    // Load leaderboard
    this.loadLeaderboard();


    // Load activities
    this.activitySubscription =
      this.activityService.activities$.subscribe(
        (activities: Activity[]) => {

          this.activities =
            activities;

          this.totalMinutes =
            this.activityService.getTotalMinutes();

          this.totalCalories =
            this.activityService.getTotalCalories();

          this.activityCount =
            this.activityService.getActivityCount();
        }
      );


    // Load carbon data
    this.updateCarbonTotal();


    this.carbonSubscription =
      this.carbonService.carbonRecords$.subscribe(
        () => {
          this.updateCarbonTotal();
        }
      );


    // Load goals
    this.updateGoalProgress();
  }


  // =========================
  // LOAD LEADERBOARD
  // =========================

  async loadLeaderboard(): Promise<void> {

    try {

      // Get token from AuthService
      const token =
        this.authService.getToken();


      if (!token) {

        console.error(
          'No authentication token found'
        );

        return;
      }


      // Call backend leaderboard API
      const response =
        await fetch(
          'http://localhost:5000/api/dashboard/leaderboard',
          {
            method: 'GET',

            headers: {
              'Content-Type':
                'application/json',

              'Authorization':
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      console.log(
        'Leaderboard response:',
        data
      );


      if (
        !response.ok ||
        !data.success
      ) {

        console.error(
          'Leaderboard API error:',
          data.message
        );

        return;
      }


      // Convert backend data
      // into frontend leaderboard format
      this.leaderboard =
        (data.leaderboard || [])
          .map((member: any) => ({

            name:
              member.name || 'User',

            avatar:
              member.avatar || '👤',

            steps:
              Number(member.steps || 0),

            activities:
              Number(member.activities || 0),

            points:
              Number(member.points || 0),

            rank:
              Number(member.rank || 0),

            you:
              member.you === true
          }));


      // Find current logged-in user
      const currentUser =
        this.leaderboard.find(
          member =>
            member.you === true
        );


      if (currentUser) {

        this.currentUserPoints =
          currentUser.points;

        this.currentUserRank =
          currentUser.rank;
      }

    }

    catch (error) {

      console.error(
        'Failed to load leaderboard:',
        error
      );
    }
  }


  // =========================
  // CARBON TOTAL
  // =========================

  private updateCarbonTotal(): void {

    const records =
      this.carbonService.getRecords();


    this.totalCarbon =
      records.reduce(
        (total, record) =>
          total +
          Number(record.emission),
        0
      );


    this.totalCarbon =
      Number(
        this.totalCarbon.toFixed(2)
      );
  }


  // =========================
  // GOAL PROGRESS
  // =========================

  private updateGoalProgress(): void {

    const savedGoals =
      localStorage.getItem(
        'ecotrack_goals'
      );


    if (!savedGoals) {

      this.totalGoals = 0;
      this.completedGoals = 0;

      return;
    }


    try {

      const goals =
        JSON.parse(savedGoals);


      if (Array.isArray(goals)) {

        this.totalGoals =
          goals.length;


        this.completedGoals =
          goals.filter(
            (goal: any) =>
              goal.completed === true ||
              Number(goal.progress) >= 100
          ).length;

      }

      else {

        this.totalGoals = 0;
        this.completedGoals = 0;
      }

    }

    catch {

      this.totalGoals = 0;
      this.completedGoals = 0;
    }
  }


  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }


  // =========================
  // DESTROY
  // =========================

  ngOnDestroy(): void {

    this.activitySubscription
      ?.unsubscribe();

    this.carbonSubscription
      ?.unsubscribe();
  }


  // =========================
  // FORMAT ACTIVITY DATE
  // =========================

  formatDate(
    date: string
  ): string {

    const activityDate =
      new Date(date);

    const today =
      new Date();

    const yesterday =
      new Date();


    yesterday.setDate(
      today.getDate() - 1
    );


    if (
      this.isSameDay(
        activityDate,
        today
      )
    ) {

      return 'Today';
    }


    if (
      this.isSameDay(
        activityDate,
        yesterday
      )
    ) {

      return 'Yesterday';
    }


    return activityDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric'
      }
    );
  }


  // =========================
  // CHECK SAME DAY
  // =========================

  private isSameDay(
    first: Date,
    second: Date
  ): boolean {

    return (

      first.getFullYear() ===
      second.getFullYear() &&

      first.getMonth() ===
      second.getMonth() &&

      first.getDate() ===
      second.getDate()

    );
  }

}