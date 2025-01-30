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

import { ThriftPipesModule } from '../../pipes';

import { KeyComponent } from './components/key/key.component';
import { ThriftTreeViewerComponent } from './thrift-tree-viewer.component';

@NgModule({
    declarations: [ThriftTreeViewerComponent, KeyComponent],
    exports: [ThriftTreeViewerComponent],
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
    ],
})
export class ThriftTreeViewerModule {}
