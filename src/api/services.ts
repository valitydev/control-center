import { Observable } from 'rxjs';

import { InjectionToken, resource } from '@angular/core';

import { loadThriftMetadataByNamespaces } from '@vality/domain-proto';
import { Accounter } from '@vality/domain-proto/accounter';
import { InvoiceTemplating } from '@vality/domain-proto/api_extensions';
import {
    AuthorManagement,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { Invoicing, PartyManagement } from '@vality/domain-proto/payment_processing';
import { WebhookManager } from '@vality/domain-proto/webhooker';
import { metadata$ as fistfulMetadata$ } from '@vality/fistful-proto';
import { metadata$ as machinegunMetadata$ } from '@vality/machinegun-proto';
import { metadata$ as magistaMetadata$ } from '@vality/magista-proto';
import { ThriftAstMetadata, ThriftFormExtension, ThriftViewExtension } from '@vality/ng-thrift';
import { metadata$ as orgManagementMetadata$ } from '@vality/org-management-proto';
import { metadata$ as repairerMetadata$ } from '@vality/repairer-proto';
import { metadata$ as scroogeMetadata$ } from '@vality/scrooge-proto';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';
import { ThriftService, createThriftServices } from '~/utils';

export const ThriftRepositoryService = createObservableService(Repository, {
    headers: (b) => ({ ...b, service: Service.DMT }),
});
export const ThriftRepositoryClientService = createObservableService(RepositoryClient, {
    headers: (b) => ({ ...b, service: Service.DMTClient }),
});
export const ThriftAuthorManagementService = createObservableService(AuthorManagement, {
    headers: (b) => ({ ...b, service: Service.DMTAuthor }),
});
export const ThriftInvoicingService = createObservableService(Invoicing, {
    headers: (b) => ({ ...b, service: Service.Invoicing }),
});
export const ThriftPartyManagementService = createObservableService(PartyManagement, {
    headers: (b) => ({ ...b, service: Service.PartyManagement }),
});
export const ThriftShopWebhooksManagementService = createObservableService(WebhookManager, {
    headers: (b) => ({ ...b, service: Service.WebhookManager }),
});
export const ThriftAccountManagementService = createObservableService(Accounter, {
    headers: (b) => ({ ...b, service: Service.Accounter }),
});
export const ThriftInvoiceTemplatingService = createObservableService(InvoiceTemplating, {
    headers: (b) => ({ ...b, service: Service.InvoiceTemplating }),
});

export const DOMAIN_METADATA_RESOURCE = new InjectionToken('DOMAIN_METADATA_RESOURCE', {
    providedIn: 'root',
    factory: () =>
        resource({
            loader: () =>
                loadThriftMetadataByNamespaces([
                    'domain_config_v2',
                    'payment_processing',
                    'webhooker',
                    'accounter',
                    'api_extensions',
                ]),
        }),
});

export interface MetadataThriftService extends ThriftService {
    metadata$: Observable<ThriftAstMetadata[]>;
    namespace: string;
    service: string;
    getFormExtensions?: () => Observable<ThriftFormExtension[]>;
    getViewExtensions?: () => Observable<ThriftViewExtension[]>;
}

export const services = [
    // Repairer
    {
        name: Service.RepairManagement,
        loader: () => import('@vality/repairer-proto/repairer').then((m) => m.RepairManagement),
        metadata$: repairerMetadata$,
        namespace: 'repairer',
        service: 'RepairManagement',
        public: 'RepairManagement',
    },
    // Scrooge
    {
        name: Service.Scrooge,
        loader: () => import('@vality/scrooge-proto/account_balance').then((m) => m.AccountService),
        metadata$: scroogeMetadata$,
        namespace: 'account_balance',
        service: 'AccountService',
        public: 'AccountManagement',
    },
    // Magista
    {
        name: Service.MerchantStatistics,
        loader: () =>
            import('@vality/magista-proto/magista').then((m) => m.MerchantStatisticsService),
        metadata$: magistaMetadata$,
        namespace: 'magista',
        service: 'MerchantStatisticsService',
        public: 'MerchantStatistics',
    },
    // Machinegun
    {
        name: Service.Automaton,
        loader: () => import('@vality/machinegun-proto/state_processing').then((m) => m.Automaton),
        metadata$: machinegunMetadata$,
        namespace: 'state_processing',
        service: 'Automaton',
        public: 'Automaton',
    },
    // Fistful
    {
        name: Service.DepositManagement,
        loader: () => import('@vality/fistful-proto/deposit').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'deposit',
        service: 'Management',
        public: 'DepositManagement',
    },
    {
        name: Service.FistfulStatistics,
        loader: () => import('@vality/fistful-proto/fistful_stat').then((m) => m.FistfulStatistics),
        metadata$: fistfulMetadata$,
        namespace: 'fistful_stat',
        service: 'FistfulStatistics',
        public: 'FistfulStatistics',
    },
    {
        name: Service.WithdrawalManagement,
        loader: () => import('@vality/fistful-proto/withdrawal').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'withdrawal',
        service: 'Management',
        public: 'WithdrawalManagement',
    },
    {
        name: Service.SourceManagement,
        loader: () => import('@vality/fistful-proto/source').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'source',
        service: 'Management',
        public: 'SourceManagement',
    },
    {
        name: Service.WalletsWebhookManager,
        loader: () => import('@vality/fistful-proto/webhooker').then((m) => m.WebhookManager),
        metadata$: fistfulMetadata$,
        namespace: 'webhooker',
        service: 'WebhookManager',
        public: 'WalletsWebhookManager',
    },
    {
        name: Service.DestinationManagement,
        loader: () => import('@vality/fistful-proto/destination').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'destination',
        service: 'Management',
        public: 'DestinationManagement',
    },

    // Organization Management
    {
        name: Service.OrganizationManagement,
        loader: () =>
            import('@vality/org-management-proto/admin_management').then((m) => m.AdminManagement),
        metadata$: orgManagementMetadata$,
        namespace: 'admin_management',
        service: 'AdminManagement',
        public: 'OrganizationManagement',
    },
] as const;

export const { services: injectableServices, provideThriftServices } =
    createThriftServices(services);

export const {
    RepairManagement: ThriftRepairManagementService,
    Scrooge: ThriftAccountService,
    MerchantStatistics: ThriftMerchantStatisticsService,
    Automaton: ThriftAutomatonService,
    DepositManagement: ThriftDepositManagementService,
    FistfulStatistics: ThriftFistfulStatisticsService,
    WithdrawalManagement: ThriftWithdrawalManagementService,
    SourceManagement: ThriftSourceManagementService,
    WalletsWebhookManager: ThriftWalletWebhooksManagementService,
    DestinationManagement: ThriftDestinationManagementService,
    OrgManager: ThriftOrganizationManagementService,
} = injectableServices;
