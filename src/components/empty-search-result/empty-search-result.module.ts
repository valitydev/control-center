import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { EmptySearchResultComponent } from './empty-search-result.component';

@NgModule({
    declarations: [EmptySearchResultComponent],
    exports: [EmptySearchResultComponent],
    imports: [MatCardModule, FlexModule, CommonModule],
})
export class EmptySearchResultModule {}
