import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { JsonCleanLookPipe } from './json-clean-look.pipe';
import { PrettyJsonComponent } from './pretty-json.component';

@NgModule({
    imports: [CommonModule],
    declarations: [PrettyJsonComponent, JsonCleanLookPipe],
    exports: [PrettyJsonComponent],
})
export class PrettyJsonModule {}
