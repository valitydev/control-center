import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActionsModule, DialogModule, TableModule, FiltersModule } from '@vality/ng-core';

import { PageLayoutModule } from '@cc/app/shared/components';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { ThriftPipesModule } from '@cc/app/shared/pipes';

import { ClaimsComponentRouting } from './claims-routing.module';
import { ClaimsTableComponent } from './claims-table/claims-table.component';
import { ClaimsComponent } from './claims.component';
import { CreateClaimDialogComponent } from './components/create-claim-dialog/create-claim-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ClaimsComponentRouting,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatExpansionModule,
        ThriftPipesModule,
        ActionsModule,
        DialogModule,
        MerchantFieldModule,
        PageLayoutModule,
        TableModule,
        FiltersModule,
    ],
    declarations: [ClaimsComponent, ClaimsTableComponent, CreateClaimDialogComponent],
})
export class ClaimsModule {}
