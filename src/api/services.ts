import { Observable } from 'rxjs';

import { loadThriftMetadataByNamespaces as loadThriftMetadataByDomainNamespaces } from '@vality/domain-proto';
import { Accounter } from '@vality/domain-proto/accounter';
import { InvoiceTemplating } from '@vality/domain-proto/api_extensions';
import {
    AuthorManagement,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { Invoicing, PartyManagement } from '@vality/domain-proto/payment_processing';
import { WebhookManager } from '@vality/domain-proto/webhooker';
import { loadThriftMetadataByNamespaces as loadThriftMetadataByFistfulNamespaces } from '@vality/fistful-proto';
import { Management as DepositManagement } from '@vality/fistful-proto/deposit';
import { Management as DestinationManagement } from '@vality/fistful-proto/destination';
import { FistfulStatistics } from '@vality/fistful-proto/fistful_stat';
import { Management as SourceManagement } from '@vality/fistful-proto/source';
import { WebhookManager as WalletsWebhookManager } from '@vality/fistful-proto/webhooker';
import { Management as WithdrawalManagement } from '@vality/fistful-proto/withdrawal';
import { metadata$ as machinegunMetadata$ } from '@vality/machinegun-proto';
import { metadata$ as magistaMetadata$ } from '@vality/magista-proto';
import { ThriftAstMetadata, ThriftFormExtension, ThriftViewExtension } from '@vality/ng-thrift';
import { AdminManagement } from '@vality/org-management-proto/admin_management';
import { metadata$ as repairerMetadata$ } from '@vality/repairer-proto';
import { metadata$ as scroogeMetadata$ } from '@vality/scrooge-proto';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';
import { ThriftService, createThriftServices } from '~/utils';

export const ThriftRepositoryService = createObservableService(Repository, {
    headers: (h) => ({ ...h, service: Service.DMT }),
});
export const ThriftRepositoryClientService = createObservableService(RepositoryClient, {
    headers: (h) => ({ ...h, service: Service.DMTClient }),
});
export const ThriftAuthorManagementService = createObservableService(AuthorManagement, {
    headers: (h) => ({ ...h, service: Service.DMTAuthor }),
});
export const ThriftInvoicingService = createObservableService(Invoicing, {
    headers: (h) => ({ ...h, service: Service.Invoicing }),
});
export const ThriftPartyManagementService = createObservableService(PartyManagement, {
    headers: (h) => ({ ...h, service: Service.PartyManagement }),
});
export const ThriftShopWebhooksManagementService = createObservableService(WebhookManager, {
    headers: (h) => ({ ...h, service: Service.WebhookManager }),
});
export const ThriftAccountManagementService = createObservableService(Accounter, {
    headers: (h) => ({ ...h, service: Service.Accounter }),
});
export const ThriftInvoiceTemplatingService = createObservableService(InvoiceTemplating, {
    headers: (h) => ({ ...h, service: Service.InvoiceTemplating }),
});

export function loadDomainMetadata() {
    return loadThriftMetadataByDomainNamespaces([
        'domain_config_v2',
        'payment_processing',
        'webhooker',
        'accounter',
        'api_extensions',
    ]);
}

export const ThriftOrganizationManagementService = createObservableService(AdminManagement, {
    headers: (h) => ({ ...h, service: Service.OrganizationManagement }),
});

// Fistful
export const ThriftDepositManagementService = createObservableService(DepositManagement, {
    headers: (h) => ({ ...h, service: Service.DepositManagement }),
});
export const ThriftFistfulStatisticsService = createObservableService(FistfulStatistics, {
    headers: (h) => ({ ...h, service: Service.FistfulStatistics }),
});
export const ThriftWithdrawalManagementService = createObservableService(WithdrawalManagement, {
    headers: (h) => ({ ...h, service: Service.WithdrawalManagement }),
});
export const ThriftSourceManagementService = createObservableService(SourceManagement, {
    headers: (h) => ({ ...h, service: Service.SourceManagement }),
});
export const ThriftWalletWebhooksManagementService = createObservableService(
    WalletsWebhookManager,
    {
        headers: (h) => ({ ...h, service: Service.WalletsWebhookManager }),
    },
);
export const ThriftDestinationManagementService = createObservableService(DestinationManagement, {
    headers: (h) => ({ ...h, service: Service.DestinationManagement }),
});

export function loadFistfulMetadata() {
    return loadThriftMetadataByFistfulNamespaces([
        'deposit',
        'destination',
        'fistful_stat',
        'source',
        'withdrawal',
        'webhooker',
    ]);
}

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
] as const;

export const { services: injectableServices, provideThriftServices } =
    createThriftServices(services);

export const {
    RepairManagement: ThriftRepairManagementService,
    Scrooge: ThriftAccountService,
    MerchantStatistics: ThriftMerchantStatisticsService,
    Automaton: ThriftAutomatonService,
} = injectableServices;
