import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableModule } from '@vality/ng-core';

import { CreateRevertDialogModule } from './create-revert-dialog/create-revert-dialog.module';
import { RevertsComponent } from './reverts.component';

@NgModule({
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        CreateRevertDialogModule,
        MatProgressSpinnerModule,
        TableModule,
    ],
    declarations: [RevertsComponent],
    exports: [RevertsComponent],
})
export class RevertsModule {}
