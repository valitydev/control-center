import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TableModule } from '@vality/ng-core';

import { PartyShopsRoutingModule } from './party-shops-routing.module';
import { PartyShopsComponent } from './party-shops.component';

@NgModule({
    imports: [
        PartyShopsRoutingModule,
        CommonModule,
        FlexModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        TableModule,
    ],
    declarations: [PartyShopsComponent],
})
export class PartyShopsModule {}
