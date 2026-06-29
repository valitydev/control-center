import { BehaviorSubject } from 'rxjs';
import { ValuesType } from 'utility-types';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import { PartyConfigRef, ShopConfig, TermSetHierarchyRef } from '@vality/domain-proto/domain';
import { InsertOp } from '@vality/domain-proto/domain_config_v2';
import {
    DEFAULT_DIALOG_CONFIG,
    DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    DialogConfig,
    DialogModule,
    DialogService,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    Option,
    SelectFieldModule,
    getNoTimeZoneIsoString,
    progressTo,
} from '@vality/matez';

import { DomainService } from '~/api/domain-config';
import { ConfigService, DEFAULT_PRESET, PRESETS, Preset } from '~/services';

import { AccountFieldComponent, CurrencyAccount } from '../account-field';
import { MerchantFieldModule } from '../merchant-field';
import { CreateDomainObjectDialogComponent, DomainObjectFieldComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-create-shop-dialog',
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        DomainObjectFieldComponent,
        FormField,
        InputFieldModule,
        SelectFieldModule,
        AccountFieldComponent,
    ],
    templateUrl: './create-shop-dialog.component.html',
})
export class CreateShopDialogComponent extends DialogSuperclass<
    CreateShopDialogComponent,
    {
        partyId?: PartyConfigRef['id'];
    } | void
> {
    private domainService = inject(DomainService);
    private destroyRef = inject(DestroyRef);
    private log = inject(NotifyLogService);
    private configService = inject(ConfigService);
    private dialogService = inject(DialogService);

    static override defaultDialogConfig: ValuesType<DialogConfig> = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

    shopModel = signal<{
        preset: Preset;
        partyId: PartyConfigRef['id'] | null;
        termsetId: TermSetHierarchyRef['id'] | null;
        name: ShopConfig['name'] | null;
        description: ShopConfig['description'] | null;
        account: CurrencyAccount | null;
    }>({
        preset: DEFAULT_PRESET,
        partyId: (this.dialogData && this.dialogData?.partyId) ?? null,
        termsetId: null,
        name: '',
        description: '',
        account: null,
    });

    shopForm = form(this.shopModel, (schemaPath) => {
        required(schemaPath.name);
        required(schemaPath.partyId);
        required(schemaPath.termsetId);
        required(schemaPath.account);
    });
    presets: Option<Preset>[] = [...PRESETS];
    progress$ = new BehaviorSubject(0);
    isReview = false;
    preset = computed(() => {
        const defaultConfig = this.configService.config.value().default;
        return defaultConfig[this.shopModel().preset] || defaultConfig[DEFAULT_PRESET];
    });

    constructor() {
        super();
        effect(() => {
            if (this.configService.config.value()) {
                this.shopForm.termsetId().value.set(this.preset().termset ?? null);
            }
        });
    }

    create() {
        const insert: InsertOp = {
            object: {
                shop_config: {
                    ...this.getShopConfig(),
                },
            },
        };
        this.domainService
            .commit([{ insert }])
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.log.successOperation('create', 'shop');
                this.closeWithSuccess();
            });
    }

    editFull() {
        this.closeWithCancellation();
        this.dialogService.open(CreateDomainObjectDialogComponent, {
            objectType: 'shop_config',
            noType: true,
            initValue: this.getShopConfig(),
            noNavigate: true,
        });
    }

    private getShopConfig(): ShopConfig {
        const value = this.shopModel();

        return {
            name: value.name,
            description: value.description,
            party_ref: { id: value.partyId },
            terms: { id: value.termsetId },
            account: {
                currency: { symbolic_code: value.account.currency },
                settlement: value.account.accounts[0],
                guarantee: value.account.accounts[1],
            },

            block: {
                unblocked: {
                    reason: value.preset,
                    since: getNoTimeZoneIsoString(new Date()),
                },
            },
            suspension: { active: { since: getNoTimeZoneIsoString(new Date()) } },
            payment_institution: { id: this.preset().paymentInstitution },
            location: { url: 'none' },
            category: { id: this.preset().category },
        };
    }
}
