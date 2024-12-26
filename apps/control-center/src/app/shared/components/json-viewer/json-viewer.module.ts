import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TagModule } from '@vality/matez';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { DetailsItemModule } from '../../../../components/details-item/details-item.module';

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
        TagModule,
    ],
})
export class JsonViewerModule {}
