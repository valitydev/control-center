import { Observable } from 'rxjs';

import { inject } from '@angular/core';

import { metadata$ as domainMetadata$ } from '@vality/domain-proto';
import { metadata$ as dominatorMetadata$ } from '@vality/dominator-proto';
import { metadata$ as fistfulMetadata$ } from '@vality/fistful-proto';
import { metadata$ as machinegunMetadata$ } from '@vality/machinegun-proto';
import { metadata$ as magistaMetadata$ } from '@vality/magista-proto';
import { ThriftAstMetadata, ThriftFormExtension, ThriftViewExtension } from '@vality/ng-thrift';
import { metadata$ as repairerMetadata$ } from '@vality/repairer-proto';
import { metadata$ as scroogeMetadata$ } from '@vality/scrooge-proto';

import { DomainMetadataFormExtensionsService } from '~/components/thrift-api-crud';
import { DomainMetadataViewExtensionsService } from '~/components/thrift-api-crud/domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { ThriftService, createThriftServices } from '~/utils';

export interface MetadataThriftService extends ThriftService {
    metadata$: Observable<ThriftAstMetadata[]>;
    namespace: string;
    service: string;
    getFormExtensions?: () => Observable<ThriftFormExtension[]>;
    getViewExtensions?: () => Observable<ThriftViewExtension[]>;
}

// TODO
const domainData = {
    metadata$: domainMetadata$,
    getFormExtensions: () => inject(DomainMetadataFormExtensionsService).extensions$,
    getViewExtensions: () => inject(DomainMetadataViewExtensionsService).extensions$,
} as const;

export const services = [
    // Domain
    {
        ...domainData,
        name: 'DMT',
        loader: () => import('@vality/domain-proto/domain_config_v2').then((m) => m.Repository),
        namespace: 'domain_config_v2',
        service: 'Repository',
        public: 'Repository',
    },
    {
        ...domainData,
        name: 'DMTClient',
        loader: () =>
            import('@vality/domain-proto/domain_config_v2').then((m) => m.RepositoryClient),
        namespace: 'domain_config_v2',
        service: 'RepositoryClient',
        public: 'RepositoryClient',
    },
    {
        ...domainData,
        name: 'DMTAuthor',
        loader: () =>
            import('@vality/domain-proto/domain_config_v2').then((m) => m.AuthorManagement),
        namespace: 'domain_config_v2',
        service: 'AuthorManagement',
        public: 'AuthorManagement',
    },
    {
        ...domainData,
        name: 'Invoicing',
        loader: () => import('@vality/domain-proto/payment_processing').then((m) => m.Invoicing),
        namespace: 'payment_processing',
        service: 'Invoicing',
        public: 'Invoicing',
    },
    {
        ...domainData,
        name: 'PartyManagement',
        loader: () =>
            import('@vality/domain-proto/payment_processing').then((m) => m.PartyManagement),
        namespace: 'payment_processing',
        service: 'PartyManagement',
        public: 'PartyManagement',
    },
    // Repairer
    {
        name: 'RepairManagement',
        loader: () => import('@vality/repairer-proto/repairer').then((m) => m.RepairManagement),
        metadata$: repairerMetadata$,
        namespace: 'repairer',
        service: 'RepairManagement',
        public: 'RepairManagement',
    },
    // Scrooge
    {
        name: 'Scrooge',
        loader: () => import('@vality/scrooge-proto/account_balance').then((m) => m.AccountService),
        metadata$: scroogeMetadata$,
        namespace: 'account_balance',
        service: 'AccountService',
        public: 'Account',
    },
    // Magista
    {
        name: 'MerchantStatistics',
        loader: () =>
            import('@vality/magista-proto/magista').then((m) => m.MerchantStatisticsService),
        metadata$: magistaMetadata$,
        namespace: 'magista',
        service: 'MerchantStatisticsService',
        public: 'MerchantStatistics',
    },
    // Dominator
    {
        name: 'Dominator',
        loader: () => import('@vality/dominator-proto/dominator').then((m) => m.DominatorService),
        metadata$: dominatorMetadata$,
        namespace: 'dominator',
        service: 'DominatorService',
        public: 'Dominator',
    },
    // Machinegun
    {
        name: 'Automaton',
        loader: () => import('@vality/machinegun-proto/state_processing').then((m) => m.Automaton),
        metadata$: machinegunMetadata$,
        namespace: 'state_processing',
        service: 'Automaton',
        public: 'Automaton',
    },
    // Fistful
    {
        name: 'DepositManagement',
        loader: () => import('@vality/fistful-proto/deposit').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'deposit',
        service: 'Management',
        public: 'DepositManagement',
    },
    {
        name: 'FistfulStatistics',
        loader: () => import('@vality/fistful-proto/fistful_stat').then((m) => m.FistfulStatistics),
        metadata$: fistfulMetadata$,
        namespace: 'fistful_stat',
        service: 'FistfulStatistics',
        public: 'FistfulStatistics',
    },
    {
        name: 'WithdrawalManagement',
        loader: () => import('@vality/fistful-proto/withdrawal').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'withdrawal',
        service: 'Management',
        public: 'WithdrawalManagement',
    },
    {
        name: 'SourceManagement',
        loader: () => import('@vality/fistful-proto/source').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'source',
        service: 'Management',
        public: 'SourceManagement',
    },
    {
        name: 'WebhookManager',
        loader: () => import('@vality/fistful-proto/webhooker').then((m) => m.WebhookManager),
        metadata$: fistfulMetadata$,
        namespace: 'webhooker',
        service: 'WebhookManager',
        public: 'WebhookManager',
    },
] as const;

export const { services: injectableServices, provideThriftServices } =
    createThriftServices(services);

export const {
    DMT: ThriftRepositoryService,
    DMTClient: ThriftRepositoryClientService,
    DMTAuthor: ThriftAuthorManagementService,
    RepairManagement: ThriftRepairManagementService,
    Scrooge: ThriftAccountService,
    MerchantStatistics: ThriftMerchantStatisticsService,
    Dominator: ThriftDominatorService,
    Automaton: ThriftAutomatonService,
    Invoicing: ThriftInvoicingService,
    PartyManagement: ThriftPartyManagementService,
    DepositManagement: ThriftDepositManagementService,
    FistfulStatistics: ThriftFistfulStatisticsService,
    WithdrawalManagement: ThriftWithdrawalManagementService,
    SourceManagement: ThriftSourceManagementService,
    WebhookManager: ThriftWebhooksManagementService,
} = injectableServices;
