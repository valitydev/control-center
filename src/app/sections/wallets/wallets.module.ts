import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TableModule, ListFieldModule, FiltersModule } from '@vality/ng-core';

import { AmountCurrencyPipe, PageLayoutModule } from '@cc/app/shared';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';

import { WalletsRoutingModule } from './wallets-routing.module';
import { WalletsComponent } from './wallets.component';

@NgModule({
    imports: [
        CommonModule,
        WalletsRoutingModule,
        MatCardModule,
        TableModule,
        MatProgressSpinnerModule,
        MetadataFormModule,
        ReactiveFormsModule,
        MatInputModule,
        MerchantFieldModule,
        MatButtonModule,
        MatIconModule,
        MtxButtonModule,
        AmountCurrencyPipe,
        PageLayoutModule,
        ListFieldModule,
        FiltersModule,
    ],
    declarations: [WalletsComponent],
})
export class WalletsModule {}
