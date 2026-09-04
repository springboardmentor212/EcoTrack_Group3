import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CarbonRecord {
  id: number;
  category: string;
  icon: string;
  amount: number;
  emission: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarbonService {

  private readonly storageKey = 'ecotrack_carbon_records';

  private carbonSubject = new BehaviorSubject<CarbonRecord[]>(
    this.loadRecords()
  );

  carbonRecords$ = this.carbonSubject.asObservable();

  private loadRecords(): CarbonRecord[] {

    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  private saveRecords(records: CarbonRecord[]): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(records)
    );

    this.carbonSubject.next(records);
  }

  getRecords(): CarbonRecord[] {
    return this.carbonSubject.value;
  }

  addRecord(record: Omit<CarbonRecord, 'id'>): void {

    const records = this.getRecords();

    const newRecord: CarbonRecord = {
      ...record,
      id: Date.now()
    };

    this.saveRecords([
      newRecord,
      ...records
    ]);
  }

  deleteRecord(id: number): void {

    const updatedRecords =
      this.getRecords().filter(
        record => record.id !== id
      );

    this.saveRecords(updatedRecords);
  }

  getTotalEmissions(): number {

    return Number(
      this.getRecords()
        .reduce(
          (total, record) => total + record.emission,
          0
        )
        .toFixed(2)
    );
  }

  getRecordCount(): number {
    return this.getRecords().length;
  }
}