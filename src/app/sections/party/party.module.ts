import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { TableOfContentsComponent } from '@vality/ng-core';

import { PageLayoutModule } from '../../shared';

import { PartyRouting } from './party-routing.module';
import { PartyComponent } from './party.component';

@NgModule({
    imports: [
        PartyRouting,
        CommonModule,
        MatTabsModule,
        MatButtonModule,
        PageLayoutModule,
        TableOfContentsComponent,
    ],
    declarations: [PartyComponent],
})
export class PartyModule {}
