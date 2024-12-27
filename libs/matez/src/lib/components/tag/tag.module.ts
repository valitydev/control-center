import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

import { TagComponent } from './tag.component';

@NgModule({
    declarations: [TagComponent],
    imports: [CommonModule, MatChipsModule],
    exports: [TagComponent],
})
export class TagModule {}
