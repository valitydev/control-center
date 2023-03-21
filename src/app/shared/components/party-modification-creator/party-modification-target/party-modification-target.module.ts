import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { PrettyJsonModule } from '@cc/components/pretty-json';

import { FillInUnitIdComponent } from './fill-in-unit-id/fill-in-unit-id.component';
import { PartyItemNamePipe } from './party-item-name.pipe';
import { PartyModificationTargetComponent } from './party-modification-target.component';
import { TargetTableComponent } from './target-table/target-table.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatButtonModule,
        MatInputModule,
        MatRadioModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatTableModule,
        MatTableModule,
        MatPaginatorModule,
        PrettyJsonModule,
    ],
    declarations: [
        PartyModificationTargetComponent,
        FillInUnitIdComponent,
        TargetTableComponent,
        PartyItemNamePipe,
    ],
    exports: [PartyModificationTargetComponent],
})
export class PartyModificationTargetModule {}
