import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

import { HeadlineModule } from '@cc/components/headline';

import { PayoutDetailsRoutingModule } from './payout-details-routing.module';
import { PayoutDetailsComponent } from './payout-details.component';

@NgModule({
    declarations: [PayoutDetailsComponent],
    imports: [CommonModule, PayoutDetailsRoutingModule, HeadlineModule, FlexModule],
})
export class PayoutDetailsModule {}
