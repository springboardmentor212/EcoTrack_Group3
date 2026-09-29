import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-activity',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './track-activity.html',
  styleUrl: './track-activity.css'
})
export class TrackActivity {

  activityType = '';
  amount = 0;
  unit = '';
  carbonEmission = 0;
  showResult = false;

  selectActivity(activity: string) {
    this.activityType = activity;

    switch (activity) {
      case 'Transportation':
        this.unit = 'km';
        break;

      case 'Electricity':
        this.unit = 'kWh';
        break;

      case 'Fuel':
        this.unit = 'litres';
        break;

      case 'Food':
        this.unit = 'meals';
        break;

      case 'Waste':
        this.unit = 'kg';
        break;

      case 'Water':
        this.unit = 'litres';
        break;

      case 'Shopping':
        this.unit = '₹';
        break;

      case 'Travel':
        this.unit = 'km';
        break;

      default:
        this.unit = '';
    }

    this.showResult = false;
  }

  calculateEmission() {

    if (!this.activityType || this.amount <= 0) {
      this.showResult = false;
      return;
    }

    switch (this.activityType) {

      case 'Transportation':
        this.carbonEmission = this.amount * 0.21;
        break;

      case 'Electricity':
        this.carbonEmission = this.amount * 0.82;
        break;

      case 'Fuel':
        this.carbonEmission = this.amount * 2.31;
        break;

      case 'Food':
        this.carbonEmission = this.amount * 1.5;
        break;

      case 'Waste':
        this.carbonEmission = this.amount * 0.5;
        break;

      case 'Water':
        this.carbonEmission = this.amount * 0.0003;
        break;

      case 'Shopping':
        this.carbonEmission = this.amount * 0.0005;
        break;

      case 'Travel':
        this.carbonEmission = this.amount * 0.21;
        break;

      default:
        this.carbonEmission = 0;
    }

    this.carbonEmission = Number(this.carbonEmission.toFixed(2));
    this.showResult = true;
  }

  resetForm() {
    this.activityType = '';
    this.amount = 0;
    this.unit = '';
    this.carbonEmission = 0;
    this.showResult = false;
  }
}