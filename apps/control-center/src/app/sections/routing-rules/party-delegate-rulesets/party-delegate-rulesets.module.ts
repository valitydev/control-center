import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { DialogModule } from '@vality/matez';

import { PageLayoutModule } from '../../../shared';
import { ChangeTargetDialogModule } from '../components/change-target-dialog';
import { RoutingRulesListModule } from '../components/routing-rules-list';
import { TargetRulesetFormModule } from '../components/target-ruleset-form';

import { AttachNewRulesetDialogComponent } from './attach-new-ruleset-dialog';
import { PartyDelegateRulesetsRoutingModule } from './party-delegate-rulesets-routing.module';
import { PartyDelegateRulesetsComponent } from './party-delegate-rulesets.component';

const EXPORTED_DECLARATIONS = [PartyDelegateRulesetsComponent, AttachNewRulesetDialogComponent];

@NgModule({
    imports: [
        PartyDelegateRulesetsRoutingModule,
        MatButtonModule,
        CommonModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatPaginatorModule,
        MatMenuModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDividerModule,
        MatSelectModule,
        MatRadioModule,
        MatInputModule,
        MatProgressBarModule,
        ChangeTargetDialogModule,
        TargetRulesetFormModule,
        RoutingRulesListModule,
        DialogModule,
        PageLayoutModule,
    ],
    declarations: EXPORTED_DECLARATIONS,
    exports: EXPORTED_DECLARATIONS,
})
export class PartyDelegateRulesetsModule {}
