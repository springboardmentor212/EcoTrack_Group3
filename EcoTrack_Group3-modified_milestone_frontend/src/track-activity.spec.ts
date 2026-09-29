import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackActivity } from './track-activity';

describe('TrackActivity', () => {
  let component: TrackActivity;
  let fixture: ComponentFixture<TrackActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackActivity],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
