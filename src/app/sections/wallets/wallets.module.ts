import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';
import { EmptySearchResultModule } from '@cc/components/empty-search-result';
import { SimpleTableModule } from '@cc/components/simple-table';
import { TableModule } from '@cc/components/table';

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
        SimpleTableModule,
    ],
    declarations: [WalletsComponent],
})
export class WalletsModule {}
