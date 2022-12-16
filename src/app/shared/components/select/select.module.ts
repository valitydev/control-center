import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { SelectComponent } from './select.component';

@NgModule({
    declarations: [SelectComponent],
    exports: [SelectComponent],
    imports: [CommonModule, MatSelectModule, ReactiveFormsModule],
})
export class SelectModule {}
