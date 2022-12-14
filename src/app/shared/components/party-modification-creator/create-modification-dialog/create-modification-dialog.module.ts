import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatStepperModule } from '@angular/material/stepper';

import { ModificationNameModule } from '../modification-name';
import { PartyModificationCreationModule } from '../party-modification-creation';
import { PartyModificationEmitter } from '../party-modification-emitter.service';
import { PartyModificationTargetModule } from '../party-modification-target';
import { CreateModificationDialogComponent } from './create-modification-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatStepperModule,
        MatButtonModule,
        PartyModificationCreationModule,
        PartyModificationTargetModule,
        ModificationNameModule,
    ],
    declarations: [CreateModificationDialogComponent],
    providers: [PartyModificationEmitter],
})
export class CreateModificationDialogModule {}
