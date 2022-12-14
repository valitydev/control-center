import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { RouterModule } from '@angular/router';

import { ChangeTargetDialogModule } from '../change-target-dialog';
import { RoutingRulesListModule } from '../routing-rules-list';
import { RoutingRulesetHeaderModule } from '../routing-ruleset-header';
import { AddPartyRoutingRuleDialogModule } from './add-party-routing-rule-dialog';
import { InitializeRoutingRulesDialogModule } from './initialize-routing-rules-dialog';
import { PartyRoutingRulesetRoutingModule } from './party-routing-ruleset-routing.module';
import { PartyRoutingRulesetComponent } from './party-routing-ruleset.component';

@NgModule({
    imports: [
        PartyRoutingRulesetRoutingModule,
        CommonModule,
        MatButtonModule,
        FlexLayoutModule,
        MatDialogModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        RouterModule,
        MatTableModule,
        MatIconModule,
        MatMenuModule,
        MatPaginatorModule,
        MatCardModule,
        MatSelectModule,
        MatRadioModule,
        MatExpansionModule,
        RoutingRulesetHeaderModule,
        AddPartyRoutingRuleDialogModule,
        InitializeRoutingRulesDialogModule,
        MatProgressBarModule,
        ChangeTargetDialogModule,
        RoutingRulesListModule,
    ],
    declarations: [PartyRoutingRulesetComponent],
})
export class PartyRoutingRulesetModule {}
