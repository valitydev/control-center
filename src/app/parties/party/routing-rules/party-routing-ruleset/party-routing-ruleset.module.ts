import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';

import { PageLayoutModule } from '../../../../shared';
import { ChangeTargetDialogModule } from '../components/change-target-dialog';
import { RoutingRulesListModule } from '../components/routing-rules-list';

import { AddPartyRoutingRuleDialogModule } from './add-party-routing-rule-dialog';
import { InitializeRoutingRulesDialogModule } from './initialize-routing-rules-dialog';
import { PartyRoutingRulesetRoutingModule } from './party-routing-ruleset-routing.module';
import { PartyRoutingRulesetComponent } from './party-routing-ruleset.component';

@NgModule({
    imports: [
        PartyRoutingRulesetRoutingModule,
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        RouterModule,
        MatIconModule,
        MatMenuModule,
        MatPaginatorModule,
        MatCardModule,
        MatSelectModule,
        MatRadioModule,
        MatExpansionModule,
        AddPartyRoutingRuleDialogModule,
        InitializeRoutingRulesDialogModule,
        MatProgressBarModule,
        ChangeTargetDialogModule,
        RoutingRulesListModule,
        PageLayoutModule,
    ],
    declarations: [PartyRoutingRulesetComponent],
})
export class PartyRoutingRulesetModule {}
