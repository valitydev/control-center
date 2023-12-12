import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { TableModule, DialogModule } from '@vality/ng-core';

import { DomainThriftViewerComponent } from '@cc/app/shared/components/thrift-api-crud';

import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';
import { RoutingRulesetHeaderModule } from '../routing-ruleset-header';

import { ChangeCandidatesPrioritiesDialogComponent } from './components/change-candidates-priorities-dialog/change-candidates-priorities-dialog.component';
import { RoutingRulesetRoutingModule } from './routing-ruleset-routing.module';
import { RoutingRulesetComponent } from './routing-ruleset.component';

@NgModule({
    imports: [
        RoutingRulesetRoutingModule,
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
        RoutingRulesetHeaderModule,
        MatAutocompleteModule,
        TableModule,
        DomainThriftViewerComponent,
        ThriftViewerModule,
        DialogModule,
    ],
    declarations: [RoutingRulesetComponent, ChangeCandidatesPrioritiesDialogComponent],
})
export class RoutingRulesetModule {}
