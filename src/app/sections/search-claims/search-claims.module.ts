import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSelectModule } from '@angular/material/select';
import { ActionsModule, BaseDialogModule } from '@vality/ng-core';

import { ClaimSearchFormModule } from '@cc/app/shared/components';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { ApiModelPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';
import { EmptySearchResultModule } from '@cc/components/empty-search-result';
import { TableModule } from '@cc/components/table';

import { CreateClaimDialogComponent } from './components/create-claim-dialog/create-claim-dialog.component';
import { SearchClaimsComponentRouting } from './search-claims-routing.module';
import { SearchClaimsComponent } from './search-claims.component';
import { SearchClaimsService } from './search-claims.service';
import { ClaimMailPipePipe } from './search-table/claim-mail-pipe.pipe';
import { SearchTableComponent } from './search-table/search-table.component';

@NgModule({
    imports: [
        CommonModule,
        SearchClaimsComponentRouting,
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
        MatTableModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatExpansionModule,
        ClaimSearchFormModule,
        EmptySearchResultModule,
        ApiModelPipesModule,
        ThriftPipesModule,
        TableModule,
        ActionsModule,
        BaseDialogModule,
        MerchantFieldModule,
    ],
    declarations: [
        SearchClaimsComponent,
        SearchTableComponent,
        ClaimMailPipePipe,
        CreateClaimDialogComponent,
    ],
    providers: [SearchClaimsService],
})
export class SearchClaimsModule {}
