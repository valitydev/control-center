import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

import { FistfulModule } from '@cc/app/api/deprecated-fistful';
import { DepositsTableModule } from '@cc/app/shared/components/deposits-table';
import { EmptySearchResultModule } from '@cc/components/empty-search-result';

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
        DepositsTableModule,
        EmptySearchResultModule,
        MatProgressSpinnerModule,
        FistfulModule,
    ],
    declarations: [DepositsComponent],
})
export class DepositsModule {}
