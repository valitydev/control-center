import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusinessScheduleObject } from '@vality/domain-proto/domain';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

@Component({
    selector: 'cc-business-schedule-selector',
    templateUrl: 'business-schedule-selector.component.html',
})
export class BusinessScheduleSelectorComponent implements OnInit {
    @Input()
    initialValue: string;

    @Output()
    idChange = new EventEmitter<number>();

    schedules$: Observable<BusinessScheduleObject[]>;

    isLoading = true;

    hasError = false;

    constructor(private domainStoreService: DomainStoreService, private snackBar: MatSnackBar) {}

    selectionChange(change: MatSelectChange) {
        this.idChange.emit(change.value);
    }

    ngOnInit() {
        this.schedules$ = this.domainStoreService.getObjects('business_schedule').pipe(
            tap(
                () => {
                    this.isLoading = false;
                },
                () => {
                    this.isLoading = false;
                    this.hasError = true;
                    this.snackBar.open('An error occurred while business schedule receiving', 'OK');
                }
            )
        );
    }
}
