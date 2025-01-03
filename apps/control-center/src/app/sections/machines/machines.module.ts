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
} from '@vality/matez';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { PageLayoutModule } from '../../shared';
import { ThriftFormModule } from '../../shared/components/metadata-form/thrift-form.module';
import { DomainObjectFieldComponent } from '../../shared/components/thrift-api-crud';

import { RepairByScenarioDialogComponent } from './components/repair-by-scenario-dialog/repair-by-scenario-dialog.component';
import { MachinesRoutingModule } from './machines-routing.module';
import { MachinesComponent } from './machines.component';

@NgModule({
    imports: [
        CommonModule,
        MachinesRoutingModule,
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
    declarations: [MachinesComponent, RepairByScenarioDialogComponent],
})
export class MachinesModule {}
