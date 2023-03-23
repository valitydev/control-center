import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { DateRangeComponent } from './date-range.component';

@NgModule({
    declarations: [DateRangeComponent],
    imports: [MatDatepickerModule, MatInputModule, MatIconModule, FlexModule, ReactiveFormsModule],
    exports: [DateRangeComponent],
})
export class DateRangeModule {}
