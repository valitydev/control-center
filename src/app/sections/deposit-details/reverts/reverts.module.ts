import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { CreateRevertDialogModule } from './create-revert-dialog/create-revert-dialog.module';
import { RevertsTableModule } from './reverts-table';
import { RevertsComponent } from './reverts.component';

@NgModule({
    imports: [
        CommonModule,
        FlexModule,
        MatCardModule,
        MatButtonModule,
        CreateRevertDialogModule,
        RevertsTableModule,
        MatProgressSpinnerModule,
        EmptySearchResultModule,
    ],
    declarations: [RevertsComponent],
    exports: [RevertsComponent],
})
export class RevertsModule {}
