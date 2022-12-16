import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { PartiesTableComponent } from './parties-table.component';
import { PartyActionsPipe } from './party-actions.pipe';

@NgModule({
    exports: [PartiesTableComponent],
    declarations: [PartiesTableComponent, PartyActionsPipe],
    imports: [MatTableModule, MatMenuModule, MatButtonModule, MatIconModule, CommonModule],
})
export class PartiesTableModule {}
