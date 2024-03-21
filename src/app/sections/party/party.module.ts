import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbar } from '@angular/material/toolbar';
import { NavComponent, TagModule } from '@vality/ng-core';

import { PageLayoutModule, ThriftPipesModule } from '../../shared';

import { PartyRouting } from './party-routing.module';
import { PartyComponent } from './party.component';

@NgModule({
    imports: [
        PartyRouting,
        CommonModule,
        MatTabsModule,
        MatButtonModule,
        PageLayoutModule,
        NavComponent,
        MatSidenavModule,
        MatToolbar,
        TagModule,
        ThriftPipesModule,
    ],
    declarations: [PartyComponent],
})
export class PartyModule {}
