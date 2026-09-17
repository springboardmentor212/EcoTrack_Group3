import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  Activity,
  ActivityService
} from '../../services/activity.service';

import { CarbonService } from '../../services/carbon.service';


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


  activities: Activity[] = [];


  totalMinutes = 0;

  totalCalories = 0;

  activityCount = 0;


  // Carbon Footprint

  totalCarbon = 0;


  // Goals

  totalGoals = 0;

  completedGoals = 0;


  private activitySubscription?: Subscription;

  private carbonSubscription?: Subscription;



  // ================= LEADERBOARD =================

  leaderboard: LeaderboardMember[] = [

    {
      name: 'Ananya',
      avatar: '👩',
      steps: 12500,
      activities: 6,
      points: 504,
      rank: 1
    },

    {
      name: 'Rahul',
      avatar: '👨',
      steps: 11200,
      activities: 5,
      points: 437,
      rank: 2
    },

    {
      name: 'Priya',
      avatar: '👩',
      steps: 9800,
      activities: 5,
      points: 398,
      rank: 3
    },

    {
      name: 'Arjun',
      avatar: '🧑',
      steps: 7600,
      activities: 5,
      points: 311,
      rank: 4
    },

    {
      name: 'Team3',
      avatar: '👩',
      steps: 8500,
      activities: 3,
      points: 300,
      rank: 5,
      you: true
    },

    {
      name: 'Sneha',
      avatar: '👩',
      steps: 6900,
      activities: 4,
      points: 259,
      rank: 6
    },

    {
      name: 'Vikram',
      avatar: '👨',
      steps: 5400,
      activities: 3,
      points: 199,
      rank: 7
    },

    {
      name: 'Kiran',
      avatar: '🧑',
      steps: 5100,
      activities: 3,
      points: 185,
      rank: 8
    },

    {
      name: 'Meena',
      avatar: '👩',
      steps: 4700,
      activities: 2,
      points: 172,
      rank: 9
    },

    {
      name: 'Rohit',
      avatar: '👨',
      steps: 4200,
      activities: 2,
      points: 160,
      rank: 10
    },

    {
      name: 'Divya',
      avatar: '👩',
      steps: 3900,
      activities: 2,
      points: 148,
      rank: 11
    },

    {
      name: 'Nikhil',
      avatar: '👨',
      steps: 3500,
      activities: 2,
      points: 132,
      rank: 12
    },

    {
      name: 'Aisha',
      avatar: '👩',
      steps: 3100,
      activities: 1,
      points: 118,
      rank: 13
    },

    {
      name: 'Varun',
      avatar: '👨',
      steps: 2800,
      activities: 1,
      points: 105,
      rank: 14
    }

  ];


  currentUserRank = 5;

  currentUserPoints = 300;



  constructor(

    private activityService: ActivityService,

    private carbonService: CarbonService

  ) {}



  ngOnInit(): void {


    // ================= ACTIVITY DATA =================

    this.activitySubscription =

      this.activityService.activities$.subscribe(

        (activities: Activity[]) => {


          this.activities = activities;


          this.totalMinutes =

            this.activityService.getTotalMinutes();


          this.totalCalories =

            this.activityService.getTotalCalories();


          this.activityCount =

            this.activityService.getActivityCount();


        }

      );



    // ================= CARBON FOOTPRINT =================

    this.updateCarbonTotal();


    this.carbonSubscription =

      this.carbonService.carbonRecords$.subscribe(() => {

        this.updateCarbonTotal();

      });



    // ================= GOALS =================

    this.updateGoalProgress();

  }



  // ================= CARBON =================

  private updateCarbonTotal(): void {


    const records =

      this.carbonService.getRecords();


    this.totalCarbon =

      records.reduce(

        (total, record) =>

          total + Number(record.emission),

        0

      );


    this.totalCarbon =

      Number(

        this.totalCarbon.toFixed(2)

      );

  }



  // ================= GOALS =================

  private updateGoalProgress(): void {


    const savedGoals =

      localStorage.getItem('ecotrack_goals');


    if (!savedGoals) {

      this.totalGoals = 0;

      this.completedGoals = 0;

      return;

    }


    try {


      const goals = JSON.parse(savedGoals);


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



  // ================= DESTROY =================

  ngOnDestroy(): void {


    this.activitySubscription?.unsubscribe();

    this.carbonSubscription?.unsubscribe();

  }



  // ================= DATE =================

  formatDate(date: string): string {


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