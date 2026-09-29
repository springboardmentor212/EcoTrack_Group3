import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CarbonRecord,
  CarbonService
} from '../services/carbon.service';

@Component({
  selector: 'app-carbon-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './carbon-tracking.html',
  styleUrl: './carbon-tracking.css'
})
export class CarbonTracking implements OnInit {

  /* ================================
     FORM
  ================================= */

  activityType = '';

  amount: number | null = null;

  activityDate = this.getToday();

  message = '';


  /* ================================
     DATA
  ================================= */

  records: CarbonRecord[] = [];

  totalEmissions = 0;

  activePeriod:
    'Daily' | 'Weekly' | 'Monthly' = 'Monthly';


  /* ================================
     ACTIVITY TYPES
  ================================= */

  activityTypes = [

    {
      name: 'Transportation',
      icon: '🚗',
      factor: 0.21
    },

    {
      name: 'Electricity Usage',
      icon: '⚡',
      factor: 0.82
    },

    {
      name: 'Fuel Consumption',
      icon: '⛽',
      factor: 2.31
    },

    {
      name: 'Food Consumption',
      icon: '🍴',
      factor: 1.5
    },

    {
      name: 'Waste Generation',
      icon: '🗑️',
      factor: 0.5
    },

    {
      name: 'Water Usage',
      icon: '💧',
      factor: 0.0003
    },

    {
      name: 'Online Shopping',
      icon: '🛍️',
      factor: 0.5
    },

    {
      name: 'Travel Activities',
      icon: '✈️',
      factor: 0.21
    }

  ];


  /* ================================
     GRAPH DATA
  ================================= */

  chartLabels: string[] = [];

  chartValues: number[] = [];

  maxChartValue = 1;


  /* ================================
     CATEGORY DATA
  ================================= */

  categoryData: {
    name: string;
    icon: string;
    value: number;
    percentage: number;
  }[] = [];


  /* ================================
     CONSTRUCTOR
  ================================= */

  constructor(
    private carbonService: CarbonService
  ) {}


  /* ================================
     INIT
  ================================= */

  ngOnInit(): void {

    this.records =
      this.carbonService.getRecords();

    this.updateDashboardData();

  }


  /* ================================
     SAVE / CALCULATE CARBON
  ================================= */

  calculateCarbon(): void {

    this.message = '';


    if (!this.activityType) {

      this.message =
        'Please select an activity category.';

      return;

    }


    if (
      this.amount === null ||
      this.amount <= 0
    ) {

      this.message =
        'Please enter a valid amount greater than 0.';

      return;

    }


    if (!this.activityDate) {

      this.message =
        'Please select a date.';

      return;

    }


    const selectedType =
      this.activityTypes.find(
        type =>
          type.name === this.activityType
      );


    if (!selectedType) {

      this.message =
        'Invalid activity category.';

      return;

    }


    /* ================================
       CALCULATE EMISSION
    ================================= */

    const emission =
      this.amount * selectedType.factor;


    const newRecord = {

      category:
        selectedType.name,

      icon:
        selectedType.icon,

      amount:
        Number(this.amount),

      emission:
        Number(
          emission.toFixed(2)
        ),

      date:
        this.activityDate

    };


    /* ================================
       SAVE THROUGH CARBON SERVICE
    ================================= */

    this.carbonService.addRecord(
      newRecord
    );


    /* ================================
       REFRESH LOCAL DATA
    ================================= */

    this.records =
      this.carbonService.getRecords();


    this.updateDashboardData();


    this.message =
      'Carbon footprint calculated and saved successfully!';


    /* ================================
       RESET FORM
    ================================= */

    this.activityType = '';

    this.amount = null;

    this.activityDate =
      this.getToday();

  }


  /* ================================
     DELETE RECORD
  ================================= */

  deleteRecord(id: number): void {

    this.carbonService.deleteRecord(id);


    this.records =
      this.carbonService.getRecords();


    this.updateDashboardData();

  }


  /* ================================
     UPDATE ALL DATA
  ================================= */

  updateDashboardData(): void {

    this.totalEmissions =
      this.records.reduce(
        (total, record) =>
          total + Number(record.emission),
        0
      );


    this.totalEmissions =
      Number(
        this.totalEmissions.toFixed(2)
      );


    this.createChart();

    this.createCategoryBreakdown();

  }


  /* ================================
     PERIOD BUTTON
  ================================= */

  changePeriod(
    period:
      'Daily' | 'Weekly' | 'Monthly'
  ): void {

    this.activePeriod =
      period;

    this.createChart();

  }


  /* ================================
     GRAPH
  ================================= */

  createChart(): void {

    if (
      this.activePeriod === 'Daily'
    ) {

      this.createDailyChart();

      return;

    }


    if (
      this.activePeriod === 'Weekly'
    ) {

      this.createWeeklyChart();

      return;

    }


    this.createMonthlyChart();

  }


  /* ================================
     DAILY GRAPH
  ================================= */

  private createDailyChart(): void {

    const labels: string[] = [];

    const values: number[] = [];

    const today = new Date();


    for (let i = 6; i >= 0; i--) {

      const date =
        new Date(today);

      date.setDate(
        today.getDate() - i
      );


      const dateString =
        this.formatDateForStorage(
          date
        );


      const total =
        this.records
          .filter(
            record =>
              record.date === dateString
          )
          .reduce(
            (sum, record) =>
              sum +
              Number(record.emission),
            0
          );


      labels.push(
        date.toLocaleDateString(
          'en-US',
          {
            weekday: 'short'
          }
        )
      );


      values.push(
        Number(
          total.toFixed(2)
        )
      );

    }


    this.setChartData(
      labels,
      values
    );

  }


  /* ================================
     WEEKLY GRAPH
  ================================= */

  private createWeeklyChart(): void {

    const labels: string[] = [];

    const values: number[] = [];

    const today = new Date();


    for (let i = 7; i >= 0; i--) {

      const endDate =
        new Date(today);

      endDate.setDate(
        today.getDate() -
        (i * 7)
      );


      const startDate =
        new Date(endDate);

      startDate.setDate(
        endDate.getDate() - 6
      );


      const total =
        this.records
          .filter(record => {

            const recordDate =
              new Date(record.date);


            return (
              recordDate >= startDate &&
              recordDate <= endDate
            );

          })
          .reduce(
            (sum, record) =>
              sum +
              Number(record.emission),
            0
          );


      labels.push(
        `W${8 - i}`
      );


      values.push(
        Number(
          total.toFixed(2)
        )
      );

    }


    this.setChartData(
      labels,
      values
    );

  }


  /* ================================
     MONTHLY GRAPH
  ================================= */

  private createMonthlyChart(): void {

    const labels: string[] = [];

    const values: number[] = [];

    const today = new Date();


    for (let i = 11; i >= 0; i--) {

      const date =
        new Date(
          today.getFullYear(),
          today.getMonth() - i,
          1
        );


      const month =
        date.getMonth();

      const year =
        date.getFullYear();


      const total =
        this.records
          .filter(record => {

            const recordDate =
              new Date(record.date);


            return (
              recordDate.getMonth() === month &&
              recordDate.getFullYear() === year
            );

          })
          .reduce(
            (sum, record) =>
              sum +
              Number(record.emission),
            0
          );


      labels.push(
        date.toLocaleDateString(
          'en-US',
          {
            month: 'short'
          }
        )
      );


      values.push(
        Number(
          total.toFixed(2)
        )
      );

    }


    this.setChartData(
      labels,
      values
    );

  }


  /* ================================
     SET GRAPH DATA
  ================================= */

  private setChartData(
    labels: string[],
    values: number[]
  ): void {

    this.chartLabels =
      labels;

    this.chartValues =
      values;


    const maximum =
      Math.max(
        ...values,
        1
      );


    this.maxChartValue =
      maximum;

  }


  /* ================================
     GRAPH HEIGHT
  ================================= */

  getBarHeight(
    value: number
  ): number {

    if (value === 0) {

      return 4;

    }


    return Math.max(
      (
        value /
        this.maxChartValue
      ) * 100,
      8
    );

  }


  /* ================================
     CATEGORY BREAKDOWN
  ================================= */

  createCategoryBreakdown(): void {

    const categoryTotals:
      { [key: string]: number } = {};


    this.records.forEach(
      record => {

        if (
          !categoryTotals[
            record.category
          ]
        ) {

          categoryTotals[
            record.category
          ] = 0;

        }


        categoryTotals[
          record.category
        ] += Number(
          record.emission
        );

      }
    );


    const total =
      this.totalEmissions || 1;


    this.categoryData =
      Object.keys(categoryTotals)

        .map(category => {

          const type =
            this.activityTypes.find(
              item =>
                item.name === category
            );


          const value =
            Number(
              categoryTotals[category]
                .toFixed(2)
            );


          return {

            name:
              category,

            icon:
              type?.icon || '🌱',

            value,

            percentage:
              Math.round(
                (value / total) * 100
              )

          };

        })

        .sort(
          (a, b) =>
            b.value - a.value
        );

  }


  /* ================================
     DATE
  ================================= */

  getToday(): string {

    const today =
      new Date();


    return this.formatDateForStorage(
      today
    );

  }


  private formatDateForStorage(
    date: Date
  ): string {

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
     DISPLAY DATE
  ================================= */

  formatDate(
    date: string
  ): string {

    const recordDate =
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
        recordDate,
        today
      )
    ) {

      return 'Today';

    }


    if (
      this.isSameDay(
        recordDate,
        yesterday
      )
    ) {

      return 'Yesterday';

    }


    return recordDate.toLocaleDateString(
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

}