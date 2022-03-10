import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { StatusModule } from '@cc/app/shared/components';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { ApiModelPipesModule, CommonPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';
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
        MatCardModule,
        MatProgressBarModule,
        EmptySearchResultModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MerchantFieldModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        ApiModelPipesModule,
        CommonPipesModule,
        ThriftPipesModule,
        StatusModule,
    ],
})
export class PayoutsModule {}
