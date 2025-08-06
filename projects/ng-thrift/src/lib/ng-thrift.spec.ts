import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgThrift } from './ng-thrift';

describe('NgThrift', () => {
  let component: NgThrift;
  let fixture: ComponentFixture<NgThrift>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgThrift]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgThrift);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
