import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ContentLoadingComponent, TagModule } from '@vality/matez';

import { ThriftPipesModule } from '../../../../pipes';
import { ThriftViewData } from '../../models/thrift-view-data';
import { ThriftTreeKeyComponent } from '../thrift-tree-key/thrift-tree-key.component';
import { ThriftTreeValueComponent } from '../thrift-tree-value/thrift-tree-value.component';

@Component({
    selector: 'v-thrift-tree-viewer',
    templateUrl: './thrift-tree-viewer.component.html',
    styleUrls: ['./thrift-tree-viewer.scss'],
    imports: [
        CommonModule,
        MatDividerModule,
        MatCardModule,
        ThriftPipesModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule,
        RouterModule,
        TagModule,
        ThriftTreeKeyComponent,
        ContentLoadingComponent,
        ThriftTreeValueComponent,
    ],
})
export class ThriftTreeViewerComponent {
    readonly view = input.required<ThriftViewData>();
    readonly level = input(0);
}
