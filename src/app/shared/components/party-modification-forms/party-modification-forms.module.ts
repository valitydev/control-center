import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import {
    BusinessScheduleRefComponent,
    BusinessScheduleSelectorComponent,
} from './business-schedule-ref';
import {
    AdjustmentModificationComponent,
    AdjustmentModificationUnitComponent,
    AdjustmentParamsComponent,
    ContractorComponent,
    ContractorIdComponent,
    ContractParamsComponent,
    ContractParamsLegacyComponent,
    ContractTemplateRefComponent,
    InternationalBankAccountComponent,
    InternationalBankDetailsComponent,
    InternationalLegalEntityComponent,
    LegalAgreementBindingComponent,
    LegalEntityComponent,
    PaymentInstitutionIdComponent,
    PaymentInstitutionRefComponent,
    PayoutToolInfoComponent,
    PayoutToolModificationComponent as ContractPayoutToolModificationComponent,
    PayoutToolModificationUnitComponent,
    PayoutToolParamsComponent,
    ReportPreferencesComponent,
    RepresentativeComponent,
    RepresentativeDocumentComponent,
    RussianBankAccountComponent,
    RussianLegalEntityComponent,
    TerminationComponent,
    WalletInfoComponent,
} from './contract';
import { CurrencyRefComponent } from './currency-ref';
import { FormWrapperComponent } from './form-wrapper';
import { NestedFormWrapperComponent } from './nested-form-wrapper';
import {
    CategoryRefComponent,
    ContractModificationComponent,
    PayoutToolModificationComponent,
    PayoutToolModificationComponent as ShopPayoutToolModificationComponent,
    ShopAccountCreationComponent,
    ShopDetailsComponent,
    ShopLocationComponent,
    ShopParamsComponent,
    ShopPayoutScheduleModificationComponent,
} from './shop';

const DECLARED_COMPONENTS_TO_WITH_EXPORT = [
    CategoryRefComponent,
    ShopPayoutToolModificationComponent,
    PaymentInstitutionRefComponent,
    ContractorComponent,
    ContractParamsComponent,
    PayoutToolModificationUnitComponent,
    LegalAgreementBindingComponent,
    AdjustmentModificationUnitComponent,
    ReportPreferencesComponent,
    TerminationComponent,
    ContractorIdComponent,
    ShopDetailsComponent,
    ShopLocationComponent,
    ShopAccountCreationComponent,
    ShopPayoutScheduleModificationComponent,
    ContractModificationComponent,
    PayoutToolModificationComponent,
    ContractParamsLegacyComponent,
    ShopParamsComponent,
];

@NgModule({
    declarations: [
        ...DECLARED_COMPONENTS_TO_WITH_EXPORT,
        PaymentInstitutionIdComponent,
        PayoutToolParamsComponent,
        CurrencyRefComponent,
        PayoutToolInfoComponent,
        RussianBankAccountComponent,
        InternationalBankAccountComponent,
        InternationalBankDetailsComponent,
        WalletInfoComponent,
        AdjustmentModificationComponent,
        BusinessScheduleRefComponent,
        RepresentativeComponent,
        AdjustmentParamsComponent,
        RepresentativeDocumentComponent,
        ContractTemplateRefComponent,
        LegalEntityComponent,
        RussianLegalEntityComponent,
        InternationalLegalEntityComponent,
        BusinessScheduleSelectorComponent,
        FormWrapperComponent,
        NestedFormWrapperComponent,
        ContractPayoutToolModificationComponent,
    ],
    imports: [
        FlexModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCheckboxModule,
        CommonModule,
        MatButtonModule,
        MatDatepickerModule,
        MatProgressBarModule,
        MatDividerModule,
    ],
    exports: [DECLARED_COMPONENTS_TO_WITH_EXPORT],
})
export class PartyModificationFormsModule {}
