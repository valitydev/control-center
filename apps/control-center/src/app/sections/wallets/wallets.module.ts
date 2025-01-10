import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FiltersModule, ListFieldModule, SwitchButtonModule, TableModule } from '@vality/matez';

import { PageLayoutModule } from '../../shared';
import { CurrencyFieldComponent } from '../../shared/components/currency-field';
import { MerchantFieldModule } from '../../shared/components/merchant-field/merchant-field.module';
import { ThriftFormModule } from '../../shared/components/metadata-form/thrift-form.module';

import { WalletsRoutingModule } from './wallets-routing.module';
import { WalletsComponent } from './wallets.component';

@NgModule({
    imports: [
        CommonModule,
        WalletsRoutingModule,
        MatCardModule,
        TableModule,
        MatProgressSpinnerModule,
        ThriftFormModule,
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
