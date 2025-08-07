import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NotifyLogService } from './notify-log.service';

describe('LogService', () => {
    let service: NotifyLogService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [MatSnackBar] });
        service = TestBed.inject(NotifyLogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
