import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ActionsModule,
    DialogModule,
    TableModule,
    DateRangeFieldModule,
    ListFieldModule,
    EnumKeyPipe,
    EnumKeysPipe,
    FiltersModule,
} from '@vality/ng-core';

import { PageLayoutModule, ThriftPipesModule } from '@cc/app/shared';
import { ThriftFormModule } from '@cc/app/shared/components/metadata-form';
import { DomainObjectFieldComponent } from '@cc/app/shared/components/thrift-api-crud';

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
        MatProgressBarModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule,
        MatFormFieldModule,
        MatInputModule,
        DateRangeFieldModule,
        MatSelectModule,
        ActionsModule,
        DialogModule,
        ThriftFormModule,
        MatRadioModule,
        MatChipsModule,
        EnumKeyPipe,
        EnumKeysPipe,
        DomainObjectFieldComponent,
        PageLayoutModule,
        ListFieldModule,
        ThriftPipesModule,
        FiltersModule,
    ],
    declarations: [RepairingComponent, RepairByScenarioDialogComponent],
})
export class RepairingModule {}
