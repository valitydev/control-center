import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, InputFieldModule } from '@vality/ng-core';

import { PageLayoutModule } from '../../shared';
import { ShopsTableComponent } from '../../shared/components/shops-table';

import { ShopsRoutingModule } from './shops-routing.module';
import { ShopsComponent } from './shops.component';

@NgModule({
    declarations: [ShopsComponent],
    imports: [
        CommonModule,
        ShopsRoutingModule,
        PageLayoutModule,
        InputFieldModule,
        MatButtonModule,
        ReactiveFormsModule,
        TableModule,
        TableModule,
        InputFieldModule,
        ShopsTableComponent,
    ],
})
export class ShopsModule {}
