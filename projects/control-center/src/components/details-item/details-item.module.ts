import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

import { DetailsItemComponent } from './details-item.component';

@NgModule({
    declarations: [DetailsItemComponent],
    exports: [DetailsItemComponent],
    imports: [FlexLayoutModule, CommonModule, MatIconModule],
})
export class DetailsItemModule {}
