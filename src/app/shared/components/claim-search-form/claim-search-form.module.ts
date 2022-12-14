import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';

import { ApiModelPipesModule } from '../../pipes';
import { ClaimSearchFormComponent } from './claim-search-form.component';
@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        ApiModelPipesModule,
        MerchantFieldModule,
    ],
    declarations: [ClaimSearchFormComponent],
    exports: [ClaimSearchFormComponent],
})
export class ClaimSearchFormModule {}
