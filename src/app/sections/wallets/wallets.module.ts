import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableModule, ListFieldModule, FiltersModule, SwitchButtonModule } from '@vality/ng-core';

import { PageLayoutModule } from '@cc/app/shared';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';

import { CurrencyFieldComponent } from '../../shared/components/currency-field';

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
        PageLayoutModule,
        ListFieldModule,
        FiltersModule,
        SwitchButtonModule,
        CurrencyFieldComponent,
    ],
    declarations: [WalletsComponent],
})
export class WalletsModule {}
