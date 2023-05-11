import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TableModule } from '@vality/ng-core';

import { AmountCurrencyPipe } from '@cc/app/shared';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';
import { EmptySearchResultModule } from '@cc/components/empty-search-result';

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
        MatButtonModule,
        MatIconModule,
        MtxButtonModule,
        AmountCurrencyPipe,
    ],
    declarations: [WalletsComponent],
})
export class WalletsModule {}
