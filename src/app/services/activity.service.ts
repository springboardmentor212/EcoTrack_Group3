import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Activity {
  id: number;
  type: string;
  icon: string;
  duration: number;
  distance: number;
  calories: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private readonly storageKey = 'ecotrack_activities';

  private activitiesSubject = new BehaviorSubject<Activity[]>(
    this.loadActivities()
  );

  activities$ = this.activitiesSubject.asObservable();

  constructor() {}

  private loadActivities(): Activity[] {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return [
        {
          id: 1,
          type: 'Walking',
          icon: '🚶',
          duration: 45,
          distance: 3.2,
          calories: 180,
          date: new Date().toISOString()
        },
        {
          id: 2,
          type: 'Cycling',
          icon: '🚴',
          duration: 30,
          distance: 8.5,
          calories: 220,
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          type: 'Running',
          icon: '🏃',
          duration: 25,
          distance: 3.8,
          calories: 200,
          date: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  private saveActivities(activities: Activity[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(activities)
    );

    this.activitiesSubject.next(activities);
  }

  getActivities(): Activity[] {
    return this.activitiesSubject.value;
  }

  addActivity(activity: Omit<Activity, 'id'>): void {
    const activities = this.getActivities();

    const newActivity: Activity = {
      ...activity,
      id: Date.now()
    };

    this.saveActivities([
      newActivity,
      ...activities
    ]);
  }

  deleteActivity(id: number): void {
    const updated = this.getActivities()
      .filter(activity => activity.id !== id);

    this.saveActivities(updated);
  }

  getTotalMinutes(): number {
    return this.getActivities()
      .reduce((total, activity) => total + activity.duration, 0);
  }

  getTotalCalories(): number {
    return this.getActivities()
      .reduce((total, activity) => total + activity.calories, 0);
  }

  getActivityCount(): number {
    return this.getActivities().length;
  }
}