import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
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
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { DamselModule } from '../../../thrift-services';
import { ChangeTargetDialogModule } from '../change-target-dialog';
import { RoutingRulesListModule } from '../routing-rules-list';
import { RoutingRulesetHeaderModule } from '../routing-ruleset-header';
import { AddPartyRoutingRuleDialogModule } from './add-party-routing-rule-dialog';
import { InitializePaymentRoutingRulesDialogModule } from './initialize-payment-routing-rules-dialog';
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
        DamselModule,
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
        InitializePaymentRoutingRulesDialogModule,
        MatProgressBarModule,
        ChangeTargetDialogModule,
        RoutingRulesListModule,
    ],
    declarations: [PartyRoutingRulesetComponent],
})
export class PartyRoutingRulesetModule {}
