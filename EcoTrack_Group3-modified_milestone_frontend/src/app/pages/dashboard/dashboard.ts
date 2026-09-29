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


export class Dashboard
  implements OnInit, OnDestroy {


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


  private activitySubscription?:
    Subscription;

  private carbonSubscription?:
    Subscription;


  constructor(

    private activityService:
      ActivityService,

    private carbonService:
      CarbonService,

    private authService:
      AuthService,

    private router:
      Router

  ) {}


  ngOnInit(): void {


    const user =
      this.authService.getUser();


    if (user) {

      this.userName =
        user.name || 'User';

      this.userEmail =
        user.email || '';

      this.currentUserPoints =
        Number(
          user.totalPoints || 0
        );


      this.leaderboard = [

        {

          name:
            this.userName,

          avatar:
            '👤',

          steps:
            0,

          activities:
            0,

          points:
            this.currentUserPoints,

          rank:
            1,

          you:
            true

        }

      ];

    }


    this.activitySubscription =
      this.activityService
        .activities$
        .subscribe(
          (activities: Activity[]) => {

            this.activities =
              activities;

            this.totalMinutes =
              this.activityService
                .getTotalMinutes();

            this.totalCalories =
              this.activityService
                .getTotalCalories();

            this.activityCount =
              this.activityService
                .getActivityCount();

          }
        );


    this.updateCarbonTotal();


    this.carbonSubscription =
      this.carbonService
        .carbonRecords$
        .subscribe(() => {

          this.updateCarbonTotal();

        });


    this.updateGoalProgress();

  }


  private updateCarbonTotal(): void {

    const records =
      this.carbonService
        .getRecords();


    this.totalCarbon =
      records.reduce(

        (total, record) =>

          total +
          Number(
            record.emission
          ),

        0

      );


    this.totalCarbon =
      Number(
        this.totalCarbon
          .toFixed(2)
      );

  }


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
        JSON.parse(
          savedGoals
        );


      if (
        Array.isArray(goals)
      ) {

        this.totalGoals =
          goals.length;


        this.completedGoals =
          goals.filter(
            (goal: any) =>

              goal.completed === true ||

              Number(
                goal.progress
              ) >= 100

          ).length;


      } else {

        this.totalGoals = 0;

        this.completedGoals = 0;

      }


    } catch {

      this.totalGoals = 0;

      this.completedGoals = 0;

    }

  }


  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }


  ngOnDestroy(): void {

    this.activitySubscription
      ?.unsubscribe();

    this.carbonSubscription
      ?.unsubscribe();

  }


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


    return activityDate
      .toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric'
        }
      );

  }


  private isSameDay(

    first: Date,

    second: Date

  ): boolean {

    return (

      first.getFullYear() ===
      second.getFullYear()

      &&

      first.getMonth() ===
      second.getMonth()

      &&

      first.getDate() ===
      second.getDate()

    );

  }

}