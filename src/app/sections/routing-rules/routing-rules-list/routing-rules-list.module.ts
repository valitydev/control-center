import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { RoutingRulesListComponent } from './routing-rules-list.component';

@NgModule({
    imports: [
        CommonModule,
        MatMenuModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatTableModule,
        MatIconModule,
        FlexLayoutModule,
        MatButtonModule,
    ],
    declarations: [RoutingRulesListComponent],
    exports: [RoutingRulesListComponent],
})
export class RoutingRulesListModule {}
