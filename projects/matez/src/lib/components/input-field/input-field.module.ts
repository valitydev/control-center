import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { InputFieldComponent } from './input-field.component';

@NgModule({
    declarations: [InputFieldComponent],
    exports: [InputFieldComponent],
    imports: [CommonModule, MatInputModule, FormField, MatIcon, MatIconButton],
})
export class InputFieldModule {}
