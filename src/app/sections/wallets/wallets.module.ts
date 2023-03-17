import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';

import { WalletsRoutingModule } from './wallets-routing.module';
import { WalletsComponent } from './wallets.component';

@NgModule({
    imports: [CommonModule, WalletsRoutingModule, MatCardModule, FlexModule],
    declarations: [WalletsComponent],
})
export class WalletsModule {}
