import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TableModule } from '@vality/ng-core';

import { RoutingRulesListComponent } from './routing-rules-list.component';

@NgModule({
    imports: [
        CommonModule,
        MatMenuModule,
        MatCardModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        TableModule,
    ],
    declarations: [RoutingRulesListComponent],
    exports: [RoutingRulesListComponent],
})
export class RoutingRulesListModule {}
