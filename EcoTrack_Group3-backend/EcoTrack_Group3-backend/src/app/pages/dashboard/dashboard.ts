import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  Activity,
  ActivityService
} from '../../services/activity.service';

import { CarbonService } from '../../services/carbon.service';

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

  constructor(
    private activityService: ActivityService,
    private carbonService: CarbonService
  ) {}

  ngOnInit(): void {

    // Activity data
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

    // Carbon Footprint
    this.updateCarbonTotal();

    this.carbonSubscription =
      this.carbonService.carbonRecords$.subscribe(() => {
        this.updateCarbonTotal();
      });

    // Goal Progress
    this.updateGoalProgress();
  }

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

      } else {

        this.totalGoals = 0;
        this.completedGoals = 0;

      }

    } catch {

      this.totalGoals = 0;
      this.completedGoals = 0;

    }
  }

  ngOnDestroy(): void {

    this.activitySubscription?.unsubscribe();
    this.carbonSubscription?.unsubscribe();

  }

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