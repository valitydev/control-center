import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DatetimeFieldComponent } from './datetime-field.component';

@NgModule({
    declarations: [DatetimeFieldComponent],
    exports: [DatetimeFieldComponent],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
})
export class DatetimeFieldModule {}
