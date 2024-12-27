import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { Claim } from '@vality/domain-proto/claim_management';
import {
    CurrencyRef,
    Party,
    ContractTemplateRef,
    ShopDetails,
    CategoryRef,
    RussianBankAccount,
    PaymentInstitutionRef,
    Contractor,
    ShopLocation,
} from '@vality/domain-proto/domain';
import {
    DialogModule,
    DialogSuperclass,
    DEFAULT_DIALOG_CONFIG,
    NotifyLogService,
    progressTo,
} from '@vality/matez';
import { isTypeWithAliases } from '@vality/ng-thrift';
import { of, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import short from 'short-uuid';

import { ClaimManagementService } from '../../../../api/claim-management';
import { DomainStoreService } from '../../../../api/domain-config';
import { MetadataFormExtension } from '../../../../shared/components/metadata-form/types/metadata-form-extension';
import { DomainThriftFormComponent } from '../../../../shared/components/thrift-api-crud';

const DEFAULT_RUSSIAN_BANK_ACCOUNT: RussianBankAccount = {
    account: '1',
    bank_name: '1',
    bank_post_account: '1',
    bank_bik: '1',
};

const DEFAULT_CONTRACTOR: Contractor = {
    legal_entity: {
        russian_legal_entity: {
            registered_name: '1',
            registered_number: '1',
            inn: '1',
            actual_address: '1',
            post_address: '1',
            representative_position: '1',
            representative_full_name: '1',
            representative_document: '1',
            russian_bank_account: DEFAULT_RUSSIAN_BANK_ACCOUNT,
        },
    },
};

const DEFAULT_SHOP_LOCATION: ShopLocation = {
    url: '1',
};

@Component({
    selector: 'cc-create-shop-dialog',
    standalone: true,
    imports: [
        DialogModule,
        MatButton,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        CommonModule,
    ],
    templateUrl: './create-shop-dialog.component.html',
    styles: ``,
})
export class CreateShopDialogComponent
    extends DialogSuperclass<CreateShopDialogComponent, { party: Party; claim: Claim }>
    implements OnInit
{
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;
    extensions: MetadataFormExtension[] = [
        {
            determinant: (d) =>
                of(isTypeWithAliases(d?.trueParent, 'ContractTemplateRef', 'domain')),
            extension: () =>
                of({
                    label: 'Contract Template',
                }),
        },
        {
            determinant: (d) => of(isTypeWithAliases(d?.trueParent, 'CategoryRef', 'domain')),
            extension: () =>
                of({
                    label: 'Category',
                }),
        },
        {
            determinant: (d) =>
                of(isTypeWithAliases(d?.trueParent, 'PaymentInstitutionRef', 'domain')),
            extension: () =>
                of({
                    label: 'Payment Institution',
                }),
        },
        {
            determinant: (d) => of(isTypeWithAliases(d, 'CurrencySymbolicCode', 'domain')),
            extension: () =>
                of({
                    label: 'Currency',
                }),
        },
    ];
    form = this.fb.group({
        shopDetails: [null as ShopDetails, Validators.required],
        contractTemplate: [null as ContractTemplateRef, Validators.required],
        currency: [null as CurrencyRef, Validators.required],
        category: [null as CategoryRef, Validators.required],
        paymentInstitution: [null as PaymentInstitutionRef, Validators.required],
    });
    progress$ = new BehaviorSubject(0);

    constructor(
        private claimManagementService: ClaimManagementService,
        private destroyRef: DestroyRef,
        private fb: FormBuilder,
        private log: NotifyLogService,
        private domainStoreService: DomainStoreService,
    ) {
        super();
    }

    ngOnInit() {
        this.domainStoreService
            .getObjects('payment_institution')
            .pipe(takeUntilDestroyed(this.destroyRef), first())
            .subscribe((paymentInstitutions) => {
                this.form.controls.paymentInstitution.setValue({
                    id: paymentInstitutions.sort((a, b) => b.ref.id - a.ref.id)[0].ref.id,
                });
            });
        this.domainStoreService
            .getObjects('category')
            .pipe(takeUntilDestroyed(this.destroyRef), first())
            .subscribe((categories) => {
                this.form.controls.category.setValue({
                    id: categories.sort((a, b) => b.ref.id - a.ref.id)[0].ref.id,
                });
            });
    }

    create() {
        const { shopDetails, contractTemplate, category, currency, paymentInstitution } =
            this.form.value;
        const contractorId = short().uuid();
        const contractId = short().uuid();
        const shopId = short().uuid();
        this.claimManagementService
            .UpdateClaim(
                this.dialogData.party.id,
                this.dialogData.claim.id,
                this.dialogData.claim.revision,
                [
                    {
                        party_modification: {
                            contractor_modification: {
                                id: contractorId,
                                modification: {
                                    creation: DEFAULT_CONTRACTOR,
                                },
                            },
                        },
                    },
                    {
                        party_modification: {
                            contract_modification: {
                                id: contractId,
                                modification: {
                                    creation: {
                                        contractor_id: contractorId,
                                        template: contractTemplate,
                                        payment_institution: paymentInstitution,
                                    },
                                },
                            },
                        },
                    },
                    {
                        party_modification: {
                            shop_modification: {
                                id: shopId,
                                modification: {
                                    creation: {
                                        details: shopDetails,
                                        category: category,
                                        location: DEFAULT_SHOP_LOCATION,
                                        contract_id: contractId,
                                    },
                                },
                            },
                        },
                    },
                    {
                        party_modification: {
                            shop_modification: {
                                id: shopId,
                                modification: {
                                    shop_account_creation: {
                                        currency: currency,
                                    },
                                },
                            },
                        },
                    },
                ],
            )
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.log.successOperation('update', 'claim');
                    this.closeWithSuccess();
                },
                error: this.log.error,
            });
    }
}
