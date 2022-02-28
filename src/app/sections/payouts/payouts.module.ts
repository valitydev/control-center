import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { PayoutsSearchFormComponent } from './components/payouts-search-form/payouts-search-form.component';
import { PayoutsTableComponent } from './components/payouts-table/payouts-table.component';
import { PayoutsRoutingModule } from './payouts-routing.module';
import { PayoutsComponent } from './payouts.component';

@NgModule({
    declarations: [PayoutsComponent, PayoutsTableComponent, PayoutsSearchFormComponent],
    imports: [
        CommonModule,
        PayoutsRoutingModule,
        MatButtonModule,
        FlexModule,
        MatCardModule,
        MatProgressBarModule,
        EmptySearchResultModule,
    ],
})
export class PayoutsModule {}
