import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { PartyModificationFormsModule } from '../../party-modification-forms';
import { PartyModificationCreationComponent } from './party-modification-creation.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatInputModule,
        PartyModificationFormsModule,
    ],
    declarations: [PartyModificationCreationComponent],
    exports: [PartyModificationCreationComponent],
})
export class PartyModificationCreationModule {}
