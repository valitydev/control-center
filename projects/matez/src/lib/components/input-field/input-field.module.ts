import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { InputFieldComponent } from './input-field.component';

@NgModule({
    declarations: [InputFieldComponent],
    exports: [InputFieldComponent],
    imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatIcon, MatIconButton],
})
export class InputFieldModule {}
