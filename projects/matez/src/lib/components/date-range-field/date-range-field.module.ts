import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

import { ActionsModule } from '../actions';

import { DateRangeFieldComponent } from './date-range-field.component';

@NgModule({
    declarations: [DateRangeFieldComponent],
    imports: [
        CommonModule,
        MatDatepickerModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        ActionsModule,
    ],
    exports: [DateRangeFieldComponent],
})
export class DateRangeFieldModule {}
