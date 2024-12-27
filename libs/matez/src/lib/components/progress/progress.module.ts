import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ProgressComponent } from './progress.component';

@NgModule({
    declarations: [ProgressComponent],
    imports: [CommonModule, MatProgressBarModule],
    exports: [ProgressComponent],
})
export class ProgressModule {}
