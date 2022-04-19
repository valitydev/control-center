import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';

@NgModule({
    declarations: [ClaimComponent],
    imports: [CommonModule, ClaimRoutingModule],
})
export class ClaimModule {}
