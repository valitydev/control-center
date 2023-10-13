import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { InputFieldModule, TableModule } from '@vality/ng-core';

import { DomainThriftViewerComponent } from '@cc/app/shared/components/thrift-api-crud';

import { PartyShopsRoutingModule } from './party-shops-routing.module';
import { PartyShopsComponent } from './party-shops.component';

@NgModule({
    imports: [
        PartyShopsRoutingModule,
        CommonModule,
        FlexModule,
        MatCardModule,
        TableModule,
        ReactiveFormsModule,
        InputFieldModule,
        DomainThriftViewerComponent,
    ],
    declarations: [PartyShopsComponent],
})
export class PartyShopsModule {}
