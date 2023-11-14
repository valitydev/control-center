import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { ThriftPipesModule } from '@cc/app/shared';
import { DetailsItemModule } from '@cc/components/details-item';

import { KeyComponent } from './components/key/key.component';
import { JsonViewerComponent } from './json-viewer.component';

@NgModule({
    declarations: [JsonViewerComponent, KeyComponent],
    exports: [JsonViewerComponent],
    imports: [
        CommonModule,
        MatDividerModule,
        DetailsItemModule,
        MatCardModule,
        ThriftPipesModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule,
        RouterModule,
    ],
})
export class JsonViewerModule {}
