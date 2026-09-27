import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  Activity,
  ActivityService
} from '../services/activity.service';

import { CarbonService } from '../services/carbon.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  

  userName = 'Sandhya';

  // Personal Information
  isEditing = false;

  editName = 'Sandhya';
  editEmail = 'sandhya@example.com';
  editPhone = '';
  editLocation = '';
  editDateOfBirth = '';

  // Preferences
  notificationsEnabled = true;
  locationServicesEnabled = true;
  darkModeEnabled = localStorage.getItem('ecotrack_dark_mode') === 'true';
  selectedLanguage = 'English';

  // Eco Activity Summary
  ecoPoints = 0;
  wasteRecycled = 0;
  co2Saved = 0;
  itemsRecycled = 0;

  // Profile Details
  challengesCompleted = 0;
  currentStreak = 7;

  private readonly profileStorageKey = 'ecotrack_profile';

  private activitySubscription?: Subscription;
  private carbonSubscription?: Subscription;

  constructor(
    private activityService: ActivityService,
    private carbonService: CarbonService
  ) {}

  ngOnInit(): void {
    document.body.classList.toggle(
    'dark-mode',
    this.darkModeEnabled
  );

    // Load saved personal information
    this.loadPersonalInformation();

    this.activitySubscription =
      this.activityService.activities$.subscribe(
        (activities: Activity[]) => {

          this.ecoPoints = activities.length * 10;

          this.itemsRecycled = activities.length;

          this.wasteRecycled = activities.length;
        }
      );

    this.carbonSubscription =
      this.carbonService.carbonRecords$.subscribe(() => {
        this.updateCarbon();
      });

    this.updateChallenges();
  }

  // Load Personal Information from localStorage
  private loadPersonalInformation(): void {

    const savedProfile =
      localStorage.getItem(this.profileStorageKey);

    if (!savedProfile) {
      return;
    }

    try {

      const profile = JSON.parse(savedProfile);

      this.editName =
        profile.name || 'Sandhya';

      this.editEmail =
        profile.email || 'sandhya@example.com';

      this.editPhone =
        profile.phone || '';

      this.editLocation =
        profile.location || '';

      this.editDateOfBirth =
        profile.dateOfBirth || '';

      this.userName = this.editName;

    } catch {
      // Keep default values if saved data is invalid
    }
  }

  // Save Personal Information to localStorage
  private savePersonalInformation(): void {

    const profile = {
      name: this.editName,
      email: this.editEmail,
      phone: this.editPhone,
      location: this.editLocation,
      dateOfBirth: this.editDateOfBirth
    };

    localStorage.setItem(
      this.profileStorageKey,
      JSON.stringify(profile)
    );
  }

  private updateCarbon(): void {
    this.co2Saved =
      this.carbonService.getTotalEmissions();
  }

  private updateChallenges(): void {

    const savedChallenges =
      localStorage.getItem('ecotrack_challenges');

    if (!savedChallenges) {
      this.challengesCompleted = 0;
      return;
    }

    try {

      const challenges = JSON.parse(savedChallenges);

      if (Array.isArray(challenges)) {

        this.challengesCompleted =
          challenges.filter(
            (challenge: any) =>
              challenge.completed === true
          ).length;
      }

    } catch {
      this.challengesCompleted = 0;
    }
  }

  // Open Edit Profile
  startEditing(): void {
    this.isEditing = true;
  }

  // Save Personal Information
  savePersonalInfo(): void {

    this.userName = this.editName;

    // Save permanently in browser storage
    this.savePersonalInformation();

    this.isEditing = false;
  }

  // Cancel editing
  cancelEditing(): void {

    // Reload the last saved information
    this.loadPersonalInformation();

    this.isEditing = false;
  }

  // Preferences
  toggleNotifications(): void {
    this.notificationsEnabled =
      !this.notificationsEnabled;
  }

  toggleLocationServices(): void {
    this.locationServicesEnabled =
      !this.locationServicesEnabled;
  }

toggleDarkMode(): void {
  this.darkModeEnabled = !this.darkModeEnabled;
  localStorage.setItem(
    'ecotrack_dark_mode',
    String(this.darkModeEnabled)
  );

  document.body.classList.toggle(
    'dark-mode',
    this.darkModeEnabled
  );
}

  ngOnDestroy(): void {

    this.activitySubscription?.unsubscribe();

    this.carbonSubscription?.unsubscribe();
  }
}