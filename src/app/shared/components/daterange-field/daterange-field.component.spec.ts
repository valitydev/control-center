import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaterangeFieldComponent } from './daterange-field.component';

describe('DaterangeFieldComponent', () => {
  let component: DaterangeFieldComponent;
  let fixture: ComponentFixture<DaterangeFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaterangeFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaterangeFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
