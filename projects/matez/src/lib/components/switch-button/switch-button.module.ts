import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SwitchButtonComponent } from './switch-button.component';

@NgModule({
    declarations: [SwitchButtonComponent],
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
    exports: [SwitchButtonComponent],
})
export class SwitchButtonModule {}
