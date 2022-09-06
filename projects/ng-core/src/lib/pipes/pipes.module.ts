import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InlineJsonPipe } from './inline-json.pipe';

@NgModule({
    declarations: [InlineJsonPipe],
    exports: [InlineJsonPipe],
    imports: [CommonModule],
})
export class PipesModule {}
