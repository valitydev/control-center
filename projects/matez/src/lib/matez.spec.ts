import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Matez } from './matez';

describe('Matez', () => {
  let component: Matez;
  let fixture: ComponentFixture<Matez>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Matez]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Matez);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
