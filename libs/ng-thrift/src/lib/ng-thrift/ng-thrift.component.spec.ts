import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgThriftComponent } from './ng-thrift.component';

describe('NgThriftComponent', () => {
    let component: NgThriftComponent;
    let fixture: ComponentFixture<NgThriftComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NgThriftComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NgThriftComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
