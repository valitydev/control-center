import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { RouterModule } from '@angular/router';
import { BaseDialogModule } from '@vality/ng-core';

import { DetailsItemModule } from '@cc/components/details-item';

import { ChangeTargetDialogModule } from '../change-target-dialog';
import { RoutingRulesListModule } from '../routing-rules-list';
import { RoutingRulesetHeaderModule } from '../routing-ruleset-header';
import { TargetRulesetFormModule } from '../target-ruleset-form';
import { AttachNewRulesetDialogComponent } from './attach-new-ruleset-dialog';
import { PartyDelegateRulesetsRoutingModule } from './party-delegate-rulesets-routing.module';
import { PartyDelegateRulesetsComponent } from './party-delegate-rulesets.component';

const EXPORTED_DECLARATIONS = [PartyDelegateRulesetsComponent, AttachNewRulesetDialogComponent];

@NgModule({
    imports: [
        PartyDelegateRulesetsRoutingModule,
        RoutingRulesetHeaderModule,
        MatButtonModule,
        FlexLayoutModule,
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
        DetailsItemModule,
        MatInputModule,
        MatProgressBarModule,
        ChangeTargetDialogModule,
        TargetRulesetFormModule,
        RoutingRulesListModule,
        BaseDialogModule,
    ],
    declarations: EXPORTED_DECLARATIONS,
    exports: EXPORTED_DECLARATIONS,
})
export class PartyDelegateRulesetsModule {}
