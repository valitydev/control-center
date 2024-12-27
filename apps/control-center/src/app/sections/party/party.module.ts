import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbar } from '@angular/material/toolbar';
import { NavComponent, TagModule } from '@vality/matez';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { PageLayoutModule } from '../../shared';
import { SubPageLayoutComponent } from '../../shared/components/page-layout/components/sub-page-layout/sub-page-layout.component';

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
        SubPageLayoutComponent,
    ],
    declarations: [PartyComponent],
})
export class PartyModule {}
