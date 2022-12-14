import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { ApiModelPipesModule, CommonPipesModule } from '../../pipes';
import { StatusModule } from '../status';
import { DepositActionsPipe } from './deposit-actions.pipe';
import { DepositsTableComponent } from './deposits-table.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        FlexModule,
        StatusModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        CommonPipesModule,
        ApiModelPipesModule,
    ],
    declarations: [DepositsTableComponent, DepositActionsPipe],
    exports: [DepositsTableComponent],
})
export class DepositsTableModule {}
