import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MtxSelectModule } from '@ng-matero/extensions/select';

import { SelectFieldComponent } from './select-field.component';

@NgModule({
    declarations: [SelectFieldComponent],
    exports: [SelectFieldComponent],
    imports: [
        CommonModule,
        MatInputModule,
        MtxSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
    ],
})
export class SelectFieldModule {}
