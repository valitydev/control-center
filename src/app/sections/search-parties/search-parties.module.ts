import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TableModule } from '@vality/ng-core';

import { PageLayoutModule } from '../../shared';

import { SearchPartiesRoutingModule } from './search-parties-routing.module';
import { SearchPartiesComponent } from './search-parties.component';

@NgModule({
    imports: [
        SearchPartiesRoutingModule,
        MatCardModule,
        CommonModule,
        MatProgressBarModule,
        PageLayoutModule,
        TableModule,
    ],
    declarations: [SearchPartiesComponent],
})
export class SearchPartiesModule {}
