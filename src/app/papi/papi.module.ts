import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { PayoutsService } from './payouts.service';

@NgModule({
    imports: [HttpClientModule],
    providers: [PayoutsService],
})
export class PapiModule {}
