import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RoutingRulesetHeaderComponent } from './routing-ruleset-header.component';

@NgModule({
    imports: [CommonModule, FlexLayoutModule, MatIconModule, MatButtonModule],
    declarations: [RoutingRulesetHeaderComponent],
    exports: [RoutingRulesetHeaderComponent],
})
export class RoutingRulesetHeaderModule {}
