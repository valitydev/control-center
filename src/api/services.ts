import { Observable } from 'rxjs';

import { metadata$ as machinegunMetadata$ } from '@vality/machinegun-proto';
import { metadata$ as magistaMetadata$ } from '@vality/magista-proto';
import { ThriftAstMetadata, ThriftFormExtension, ThriftViewExtension } from '@vality/ng-thrift';
import { AdminManagement } from '@vality/org-management-proto/admin_management';
import { metadata$ as repairerMetadata$ } from '@vality/repairer-proto';
import { metadata$ as scroogeMetadata$ } from '@vality/scrooge-proto';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';
import { ThriftService, createThriftServices } from '~/utils';

export * from './domain-services';
export * from './fistful-services';

export const ThriftOrganizationManagementService = createObservableService(AdminManagement, {
    headers: (h) => ({ ...h, service: Service.OrganizationManagement }),
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
] as const;

export const { services: injectableServices, provideThriftServices } =
    createThriftServices(services);

export const {
    RepairManagement: ThriftRepairManagementService,
    Scrooge: ThriftAccountService,
    MerchantStatistics: ThriftMerchantStatisticsService,
    Automaton: ThriftAutomatonService,
} = injectableServices;
