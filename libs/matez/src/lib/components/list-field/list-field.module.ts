import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { ListFieldComponent } from './list-field.component';

@NgModule({
    declarations: [ListFieldComponent],
    exports: [ListFieldComponent],
    imports: [CommonModule, MatInputModule, ReactiveFormsModule],
})
export class ListFieldModule {}
