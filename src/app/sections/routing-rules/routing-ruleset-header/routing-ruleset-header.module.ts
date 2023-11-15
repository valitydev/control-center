import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { RoutingRulesetHeaderComponent } from './routing-ruleset-header.component';

@NgModule({
    imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
    declarations: [RoutingRulesetHeaderComponent],
    exports: [RoutingRulesetHeaderComponent],
})
export class RoutingRulesetHeaderModule {}
