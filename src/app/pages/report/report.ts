import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  Activity,
  ActivityService
} from '../../services/activity.service';

import {
  CarbonRecord,
  CarbonService
} from '../../services/carbon.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [],
  templateUrl: './report.html',
  styleUrl: './report.css'
})
export class Report implements OnInit, OnDestroy {
    darkModeEnabled = localStorage.getItem('ecotrack_dark_mode') === 'true';

  totalCarbon = 0;
  carbonPercentage = 0;
  sustainabilityScore = 0;
  ecoPoints = 0;
  activitiesCompleted = 0;

  activities: Activity[] = [];
  totalMinutes = 0;
  activityCount = 0;

  walkingActivities = 0;
  cyclingActivities = 0;
  runningActivities = 0;
  otherActivities = 0;

  walkingMinutes = 0;
  cyclingMinutes = 0;
  runningMinutes = 0;
  otherMinutes = 0;

  transportCarbon = 0;
  energyCarbon = 0;
  foodCarbon = 0;
  otherCarbon = 0;

  totalGoals = 0;
  completedGoals = 0;

  challengesCompleted = 0;
  totalChallenges = 3;
  challengePoints = 0;
  currentStreak = 7;

  private activitySubscription?: Subscription;
  private carbonSubscription?: Subscription;

  constructor(
    private activityService: ActivityService,
    private carbonService: CarbonService
  ) {}
ngOnInit(): void {

 
  this.activitySubscription =
      this.activityService.activities$.subscribe(
        (activities: Activity[]) => {

          this.activities = activities;

          this.totalMinutes =
            this.activityService.getTotalMinutes();

          this.activityCount =
            this.activityService.getActivityCount();

          this.activitiesCompleted =
            this.activityCount;

          this.updateActivitySummary();
        }
      );

    this.updateCarbonData();

    this.carbonSubscription =
      this.carbonService.carbonRecords$.subscribe(() => {
        this.updateCarbonData();
      });

    this.updateGoalData();

    this.updateChallengeData();
  }


  private updateActivitySummary(): void {

    this.walkingActivities = 0;
    this.cyclingActivities = 0;
    this.runningActivities = 0;
    this.otherActivities = 0;

    this.walkingMinutes = 0;
    this.cyclingMinutes = 0;
    this.runningMinutes = 0;
    this.otherMinutes = 0;

    this.activities.forEach(activity => {

      const type = activity.type.toLowerCase();

      if (type === 'walking') {

        this.walkingActivities++;
        this.walkingMinutes += activity.duration;

      } else if (type === 'cycling') {

        this.cyclingActivities++;
        this.cyclingMinutes += activity.duration;

      } else if (type === 'running') {

        this.runningActivities++;
        this.runningMinutes += activity.duration;

      } else {

        this.otherActivities++;
        this.otherMinutes += activity.duration;
      }
    });
  }


  private updateCarbonData(): void {

    const records = this.carbonService.getRecords();

    this.totalCarbon =
      this.carbonService.getTotalEmissions();

    this.transportCarbon =
      this.getCategoryTotal(records, 'Transport');

    this.energyCarbon =
      this.getCategoryTotal(records, 'Energy');

    this.foodCarbon =
      this.getCategoryTotal(records, 'Food');

    this.otherCarbon =
      this.getOtherCarbon(records);

    /*
     * Carbon ring percentage.
     * 0 = empty ring
     * 100 = completely filled ring
     */
    this.carbonPercentage = Math.min(
      100,
      Math.max(0, Math.round(this.totalCarbon))
    );
  }


  private getCategoryTotal(
    records: CarbonRecord[],
    category: string
  ): number {

    return Number(
      records
        .filter(
          record =>
            record.category.toLowerCase() ===
            category.toLowerCase()
        )
        .reduce(
          (total, record) =>
            total + Number(record.emission),
          0
        )
        .toFixed(2)
    );
  }


  private getOtherCarbon(
    records: CarbonRecord[]
  ): number {

    const knownCategories = [
      'transport',
      'energy',
      'food'
    ];

    return Number(
      records
        .filter(
          record =>
            !knownCategories.includes(
              record.category.toLowerCase()
            )
        )
        .reduce(
          (total, record) =>
            total + Number(record.emission),
          0
        )
        .toFixed(2)
    );
  }


  private updateGoalData(): void {

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

        this.totalGoals = goals.length;

        this.completedGoals =
          goals.filter(
            (goal: any) =>
              goal.completed === true ||
              Number(goal.progress) >= 100
          ).length;
      }

    } catch {

      this.totalGoals = 0;
      this.completedGoals = 0;
    }
  }


  private updateChallengeData(): void {

    const savedChallenges =
      localStorage.getItem('ecotrack_challenges');

    if (!savedChallenges) {

      this.challengesCompleted = 0;
      this.totalChallenges = 3;
      this.challengePoints = 0;

      return;
    }

    try {

      const challenges = JSON.parse(savedChallenges);

      if (Array.isArray(challenges)) {

        this.totalChallenges =
          challenges.length;

        this.challengesCompleted =
          challenges.filter(
            (challenge: any) =>
              challenge.completed === true
          ).length;

        this.challengePoints =
          challenges
            .filter(
              (challenge: any) =>
                challenge.completed === true
            )
            .reduce(
              (total: number, challenge: any) =>
                total +
                Number(challenge.points || 0),
              0
            );
      }

    } catch {

      this.challengesCompleted = 0;
      this.totalChallenges = 3;
      this.challengePoints = 0;
    }
  }


  ngOnDestroy(): void {

    this.activitySubscription?.unsubscribe();

    this.carbonSubscription?.unsubscribe();
  }
}


