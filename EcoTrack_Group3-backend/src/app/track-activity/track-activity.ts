import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Activity,
  ActivityService
} from '../services/activity.service';

@Component({
  selector: 'app-track-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './track-activity.html',
  styleUrl: './track-activity.css'
})
export class TrackActivity implements OnInit {

  activities: Activity[] = [];

  showModal = false;

  // Activity comparison
  todayActivities = 0;
  thisWeekActivities = 0;
  lastWeekActivities = 0;

  thisWeekMinutes = 0;
  lastWeekMinutes = 0;

  thisWeekCalories = 0;
  lastWeekCalories = 0;

  activityComparison = 0;
  minutesComparison = 0;
  caloriesComparison = 0;

  comparisonMessage = '';

  activityTypes = [
    { name: 'Walking', icon: '🚶' },
    { name: 'Running', icon: '🏃' },
    { name: 'Cycling', icon: '🚴' },
    { name: 'Swimming', icon: '🏊' },
    { name: 'Hiking', icon: '🥾' },
    { name: 'Yoga', icon: '🧘' }
  ];

  form = {
    type: 'Walking',
    icon: '🚶',
    duration: null as number | null,
    distance: null as number | null,
    calories: null as number | null,
    date: this.getToday()
  };

  constructor(
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {

    this.activityService.activities$.subscribe(
      (activities: Activity[]) => {

        this.activities = activities;

        // Update comparison whenever activities change
        this.updateActivityComparison();
      }
    );
  }

  get totalMinutes(): number {
    return this.activityService.getTotalMinutes();
  }

  get totalCalories(): number {
    return this.activityService.getTotalCalories();
  }

  get activityCount(): number {
    return this.activityService.getActivityCount();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  selectType(
    type: { name: string; icon: string }
  ): void {
    this.form.type = type.name;
    this.form.icon = type.icon;
  }

  saveActivity(): void {

    if (
      !this.form.duration ||
      this.form.duration <= 0 ||
      this.form.calories === null ||
      this.form.calories < 0 ||
      !this.form.date
    ) {
      return;
    }

    this.activityService.addActivity({
      type: this.form.type,
      icon: this.form.icon,
      duration: Number(this.form.duration),
      distance: Number(this.form.distance || 0),
      calories: Number(this.form.calories),
      date: this.form.date
    });

    this.closeModal();
  }

  deleteActivity(id: number): void {
    this.activityService.deleteActivity(id);
  }

  /*
   * ACTIVITY COMPARISON
   */

  private updateActivityComparison(): void {

    const today = new Date();

    this.todayActivities = 0;
    this.thisWeekActivities = 0;
    this.lastWeekActivities = 0;

    this.thisWeekMinutes = 0;
    this.lastWeekMinutes = 0;

    this.thisWeekCalories = 0;
    this.lastWeekCalories = 0;

    const currentDay = new Date(today);
    currentDay.setHours(0, 0, 0, 0);

    // Monday = first day of week
    const dayOfWeek = currentDay.getDay();

    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const thisWeekStart = new Date(currentDay);
    thisWeekStart.setDate(
      currentDay.getDate() - daysFromMonday
    );
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(
      thisWeekStart.getDate() + 7
    );
    thisWeekEnd.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(
      thisWeekStart.getDate() - 7
    );
    lastWeekStart.setHours(0, 0, 0, 0);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setHours(0, 0, 0, 0);

    this.activities.forEach(activity => {

      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);

      // Today
      if (
        this.isSameDay(
          activityDate,
          currentDay
        )
      ) {
        this.todayActivities++;
      }

      // This week
      if (
        activityDate >= thisWeekStart &&
        activityDate < thisWeekEnd
      ) {
        this.thisWeekActivities++;

        this.thisWeekMinutes +=
          Number(activity.duration);

        this.thisWeekCalories +=
          Number(activity.calories);
      }

      // Last week
      if (
        activityDate >= lastWeekStart &&
        activityDate < lastWeekEnd
      ) {
        this.lastWeekActivities++;

        this.lastWeekMinutes +=
          Number(activity.duration);

        this.lastWeekCalories +=
          Number(activity.calories);
      }
    });

    this.activityComparison =
      this.calculatePercentageChange(
        this.thisWeekActivities,
        this.lastWeekActivities
      );

    this.minutesComparison =
      this.calculatePercentageChange(
        this.thisWeekMinutes,
        this.lastWeekMinutes
      );

    this.caloriesComparison =
      this.calculatePercentageChange(
        this.thisWeekCalories,
        this.lastWeekCalories
      );

    this.updateComparisonMessage();
  }

  private calculatePercentageChange(
    current: number,
    previous: number
  ): number {

    if (previous === 0) {

      if (current === 0) {
        return 0;
      }

      return 100;
    }

    return Math.round(
      ((current - previous) / previous) * 100
    );
  }

  private updateComparisonMessage(): void {

    if (
      this.thisWeekActivities >
      this.lastWeekActivities
    ) {

      this.comparisonMessage =
        `You're more active this week than last week. Keep it up! 💪`;

      return;
    }

    if (
      this.thisWeekActivities <
      this.lastWeekActivities
    ) {

      this.comparisonMessage =
        `You're less active this week than last week. Let's get moving! 🌱`;

      return;
    }

    this.comparisonMessage =
      `You're keeping the same activity level as last week. 👍`;
  }

  getComparisonLabel(value: number): string {

    if (value > 0) {
      return `↑ ${value}%`;
    }

    if (value < 0) {
      return `↓ ${Math.abs(value)}%`;
    }

    return 'No change';
  }

  getComparisonClass(value: number): string {

    if (value > 0) {
      return 'positive';
    }

    if (value < 0) {
      return 'negative';
    }

    return 'neutral';
  }

  formatDate(date: string): string {

    const activityDate = new Date(date);
    const today = new Date();

    const yesterday = new Date();
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
        day: 'numeric',
        year: 'numeric'
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

  private resetForm(): void {

    this.form = {
      type: 'Walking',
      icon: '🚶',
      duration: null,
      distance: null,
      calories: null,
      date: this.getToday()
    };
  }
}