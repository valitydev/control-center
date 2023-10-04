import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionsModule, DialogModule, TableModule } from '@vality/ng-core';

import { EnumKeyPipe, EnumKeysPipe, PageLayoutModule } from '@cc/app/shared';
import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';
import { DomainObjectFieldComponent } from '@cc/app/shared/components/thrift-api-crud';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { DateRangeModule } from '../../shared/components/date-range/date-range.module';

import { RepairByScenarioDialogComponent } from './components/repair-by-scenario-dialog/repair-by-scenario-dialog.component';
import { RepairingRoutingModule } from './repairing-routing.module';
import { RepairingComponent } from './repairing.component';

@NgModule({
    imports: [
        CommonModule,
        RepairingRoutingModule,
        TableModule,
        MatCardModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatProgressBarModule,
        MatButtonModule,
        EmptySearchResultModule,
        MatTableModule,
        MatTooltipModule,
        MatBadgeModule,
        MatFormFieldModule,
        MatInputModule,
        DateRangeModule,
        MatSelectModule,
        ActionsModule,
        DialogModule,
        MetadataFormModule,
        MatRadioModule,
        MatChipsModule,
        EnumKeyPipe,
        EnumKeysPipe,
        DomainObjectFieldComponent,
        PageLayoutModule,
    ],
    declarations: [RepairingComponent, RepairByScenarioDialogComponent],
})
export class RepairingModule {}
