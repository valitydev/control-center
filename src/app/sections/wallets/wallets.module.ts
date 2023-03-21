import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { TableModule } from '../../../components/table';
import { MerchantFieldModule } from '../../shared/components/merchant-field';
import { MetadataFormModule } from '../../shared/components/metadata-form';
import { SimpleFilterComponent } from './simple-filter/simple-filter.component';
import { SimpleTableComponent } from './simple-table/simple-table.component';
import { WalletsRoutingModule } from './wallets-routing.module';
import { WalletsComponent } from './wallets.component';

@NgModule({
    imports: [
        CommonModule,
        WalletsRoutingModule,
        MatCardModule,
        FlexModule,
        MatTableModule,
        TableModule,
        EmptySearchResultModule,
        MatProgressSpinnerModule,
        MetadataFormModule,
        ReactiveFormsModule,
        MatInputModule,
        MerchantFieldModule,
        GridModule,
    ],
    declarations: [WalletsComponent, SimpleTableComponent, SimpleFilterComponent],
})
export class WalletsModule {}
