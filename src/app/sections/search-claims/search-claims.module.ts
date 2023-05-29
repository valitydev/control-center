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
import { MatTableModule } from '@angular/material/table';
import { ActionsModule, DialogModule } from '@vality/ng-core';

import { ClaimSearchFormModule, PageLayoutModule } from '@cc/app/shared/components';
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
        DialogModule,
        MerchantFieldModule,
        PageLayoutModule,
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
