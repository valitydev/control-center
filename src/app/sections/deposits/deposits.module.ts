import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableModule } from '@vality/ng-core';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { PageLayoutModule } from '../../shared';

import { CreateDepositDialogModule } from './create-deposit-dialog/create-deposit-dialog.module';
import { DepositsRoutingModule } from './deposits-routing.module';
import { DepositsComponent } from './deposits.component';
import { SearchFiltersModule } from './search-filters/search-filters.module';

@NgModule({
    imports: [
        DepositsRoutingModule,
        MatCardModule,
        FlexModule,
        CommonModule,
        MatButtonModule,
        CreateDepositDialogModule,
        SearchFiltersModule,
        EmptySearchResultModule,
        MatProgressSpinnerModule,
        PageLayoutModule,
        TableModule,
    ],
    declarations: [DepositsComponent],
})
export class DepositsModule {}
