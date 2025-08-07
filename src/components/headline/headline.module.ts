import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { HeadlineComponent } from './headline.component';

const EXPORTED_DECLARATIONS = [HeadlineComponent];

@NgModule({
    imports: [CommonModule, MatIconModule],
    exports: EXPORTED_DECLARATIONS,
    declarations: EXPORTED_DECLARATIONS,
})
export class HeadlineModule {}
