import { Observable } from 'rxjs';

import { Automaton } from '@vality/machinegun-proto/state_processing';
import { metadata$ as magistaMetadata$ } from '@vality/magista-proto';
import { ThriftAstMetadata, ThriftFormExtension, ThriftViewExtension } from '@vality/ng-thrift';
import { AdminManagement } from '@vality/org-management-proto/admin_management';
import { metadata$ as repairerMetadata$ } from '@vality/repairer-proto';
import { AccountService } from '@vality/scrooge-proto/account_balance';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';
import { ThriftService, createThriftServices } from '~/utils';

export * from './domain-services';
export * from './fistful-services';

export const ThriftOrganizationManagementService = createObservableService(AdminManagement, {
    headers: (h) => ({ ...h, service: Service.OrganizationManagement }),
});

export const ThriftAutomatonService = createObservableService(Automaton, {
    headers: (h) => ({ ...h, service: Service.Automaton }),
});

export const ThriftAccountService = createObservableService(AccountService, {
    headers: (h) => ({ ...h, service: Service.Scrooge }),
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
] as const;

export const { services: injectableServices, provideThriftServices } =
    createThriftServices(services);

export const {
    RepairManagement: ThriftRepairManagementService,
    MerchantStatistics: ThriftMerchantStatisticsService,
} = injectableServices;
