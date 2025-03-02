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
import { DialogModule, TableModule } from '@vality/matez';
import { ThriftViewerModule } from '@vality/ng-thrift';

import { PageLayoutModule } from '../../../shared';
import { DomainThriftViewerComponent } from '../../../shared/components/thrift-api-crud';

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
        MatAutocompleteModule,
        TableModule,
        DomainThriftViewerComponent,
        ThriftViewerModule,
        DialogModule,
        PageLayoutModule,
    ],
    declarations: [RoutingRulesetComponent],
})
export class RoutingRulesetModule {}
