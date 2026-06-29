import { BehaviorSubject } from 'rxjs';
import { ValuesType } from 'utility-types';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import { PartyConfigRef, TermSetHierarchyRef, WalletConfig } from '@vality/domain-proto/domain';
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
    selector: 'cc-create-wallet-dialog',
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
    templateUrl: './create-wallet-dialog.component.html',
})
export class CreateWalletDialogComponent extends DialogSuperclass<
    CreateWalletDialogComponent,
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

    walletModel = signal<{
        preset: Preset;
        partyId: PartyConfigRef['id'] | null;
        termsetId: TermSetHierarchyRef['id'] | null;
        name: WalletConfig['name'] | null;
        description: WalletConfig['description'] | null;
        account: CurrencyAccount | null;
    }>({
        preset: DEFAULT_PRESET,
        partyId: (this.dialogData && this.dialogData?.partyId) ?? null,
        termsetId: null,
        name: '',
        description: '',
        account: null,
    });

    walletForm = form(this.walletModel, (schemaPath) => {
        required(schemaPath.name);
        required(schemaPath.partyId);
        required(schemaPath.termsetId);
        required(schemaPath.account);
    });
    presets: Option<Preset>[] = [...PRESETS];
    progress$ = new BehaviorSubject(0);
    preset = computed(() => {
        const defaultConfig = this.configService.config.value().default;
        return defaultConfig[this.walletModel().preset] || defaultConfig[DEFAULT_PRESET];
    });

    constructor() {
        super();
        effect(() => {
            if (this.configService.config.value()) {
                this.walletForm.termsetId().value.set(this.preset().termset ?? null);
            }
        });
    }

    create() {
        const insert: InsertOp = {
            object: {
                wallet_config: {
                    ...this.getWalletConfig(),
                },
            },
        };
        this.domainService
            .commit([{ insert }])
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.log.successOperation('create', 'wallet');
                this.closeWithSuccess();
            });
    }

    editFull() {
        this.closeWithCancellation();
        this.dialogService.open(CreateDomainObjectDialogComponent, {
            objectType: 'wallet_config',
            noType: true,
            initValue: this.getWalletConfig(),
            noNavigate: true,
        });
    }

    private getWalletConfig(): WalletConfig {
        const value = this.walletModel();

        return {
            name: value.name,
            description: value.description,
            party_ref: { id: value.partyId },
            terms: { id: value.termsetId },
            account: {
                currency: { symbolic_code: value.account.currency },
                settlement: value.account.accounts[0],
            },

            block: {
                unblocked: {
                    reason: value.preset,
                    since: getNoTimeZoneIsoString(new Date()),
                },
            },
            suspension: { active: { since: getNoTimeZoneIsoString(new Date()) } },
            payment_institution: { id: this.preset().paymentInstitution },
        };
    }
}
