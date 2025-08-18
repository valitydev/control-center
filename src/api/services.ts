import { Observable } from 'rxjs';

import { metadata$ as domainMetadata$ } from '@vality/domain-proto';
import { metadata$ as dominatorMetadata$ } from '@vality/dominator-proto';
import { metadata$ as fistfulMetadata$ } from '@vality/fistful-proto';
import { metadata$ as machinegunMetadata$ } from '@vality/machinegun-proto';
import { metadata$ as magistaMetadata$ } from '@vality/magista-proto';
import { ThriftAstMetadata } from '@vality/ng-thrift';
import { metadata$ as repairerMetadata$ } from '@vality/repairer-proto';
import { metadata$ as scroogeMetadata$ } from '@vality/scrooge-proto';

import { ThriftService, createThriftServices } from '~/utils';

export interface MetadataThriftService extends ThriftService {
    metadata$: Observable<ThriftAstMetadata[]>;
    namespace: string;
    service: string;
}

export const services = [
    // Domain
    {
        name: 'DMT',
        loader: () => import('@vality/domain-proto/domain_config_v2').then((m) => m.Repository),
        metadata$: domainMetadata$,
        namespace: 'domain_config_v2',
        service: 'Repository',
    },
    {
        name: 'DMTClient',
        loader: () =>
            import('@vality/domain-proto/domain_config_v2').then((m) => m.RepositoryClient),
        metadata$: domainMetadata$,
        namespace: 'domain_config_v2',
        service: 'RepositoryClient',
    },
    {
        name: 'DMTAuthor',
        loader: () =>
            import('@vality/domain-proto/domain_config_v2').then((m) => m.AuthorManagement),
        metadata$: domainMetadata$,
        namespace: 'domain_config_v2',
        service: 'AuthorManagement',
    },
    {
        name: 'Invoicing',
        loader: () => import('@vality/domain-proto/payment_processing').then((m) => m.Invoicing),
        metadata$: domainMetadata$,
        namespace: 'payment_processing',
        service: 'Invoicing',
    },
    {
        name: 'PartyManagement',
        loader: () =>
            import('@vality/domain-proto/payment_processing').then((m) => m.PartyManagement),
        metadata$: domainMetadata$,
        namespace: 'payment_processing',
        service: 'PartyManagement',
    },
    // Repairer
    {
        name: 'RepairManagement',
        loader: () => import('@vality/repairer-proto/repairer').then((m) => m.RepairManagement),
        metadata$: repairerMetadata$,
        namespace: 'repairer',
        service: 'RepairManagement',
    },
    // Scrooge
    {
        name: 'Scrooge',
        loader: () => import('@vality/scrooge-proto/account_balance').then((m) => m.AccountService),
        metadata$: scroogeMetadata$,
        namespace: 'account_balance',
        service: 'AccountService',
    },
    // Magista
    {
        name: 'MerchantStatistics',
        loader: () =>
            import('@vality/magista-proto/magista').then((m) => m.MerchantStatisticsService),
        metadata$: magistaMetadata$,
        namespace: 'magista',
        service: 'MerchantStatisticsService',
    },
    // Dominator
    {
        name: 'Dominator',
        loader: () => import('@vality/dominator-proto/dominator').then((m) => m.DominatorService),
        metadata$: dominatorMetadata$,
        namespace: 'dominator',
        service: 'DominatorService',
    },
    // Machinegun
    {
        name: 'Automaton',
        loader: () => import('@vality/machinegun-proto/state_processing').then((m) => m.Automaton),
        metadata$: machinegunMetadata$,
        namespace: 'state_processing',
        service: 'Automaton',
    },
    // Fistful
    {
        name: 'DepositManagement',
        loader: () => import('@vality/fistful-proto/deposit').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'deposit',
        service: 'Management',
    },
    {
        name: 'FistfulStatistics',
        loader: () => import('@vality/fistful-proto/fistful_stat').then((m) => m.FistfulStatistics),
        metadata$: fistfulMetadata$,
        namespace: 'fistful_stat',
        service: 'FistfulStatistics',
    },
    {
        name: 'WithdrawalManagement',
        loader: () => import('@vality/fistful-proto/withdrawal').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'withdrawal',
        service: 'Management',
    },
    {
        name: 'SourceManagement',
        loader: () => import('@vality/fistful-proto/source').then((m) => m.Management),
        metadata$: fistfulMetadata$,
        namespace: 'source',
        service: 'Management',
    },
] as const;

export const {
    services: {
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
    },
    provideThriftServices,
} = createThriftServices(services);
