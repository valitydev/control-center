import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { TagComponent } from './tag.component';

@NgModule({
    declarations: [TagComponent],
    imports: [CommonModule, MatChipsModule, MatIconModule],
    exports: [TagComponent],
})
export class TagModule {}
