import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatezComponent } from './matez.component';

describe('MatezComponent', () => {
    let component: MatezComponent;
    let fixture: ComponentFixture<MatezComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatezComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MatezComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
