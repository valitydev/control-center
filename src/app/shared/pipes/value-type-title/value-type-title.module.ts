import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ValueTypeTitlePipe } from './value-type-title.pipe';

@NgModule({
    declarations: [ValueTypeTitlePipe],
    imports: [CommonModule],
    exports: [ValueTypeTitlePipe],
})
export class ValueTypeTitleModule {}
