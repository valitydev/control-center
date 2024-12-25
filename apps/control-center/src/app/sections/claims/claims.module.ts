import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { ActionsModule, DialogModule, TableModule, FiltersModule } from '@vality/matez';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { PageLayoutModule } from '@cc/app/shared/components';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';

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
