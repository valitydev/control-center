import { Automaton } from '@vality/machinegun-proto/state_processing';
import { MerchantStatisticsService } from '@vality/magista-proto';
import { AdminManagement } from '@vality/org-management-proto/admin_management';
import { RepairManagement } from '@vality/repairer-proto';
import { AccountService } from '@vality/scrooge-proto/account_balance';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';

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

export const ThriftRepairManagementService = createObservableService(RepairManagement, {
    headers: (h) => ({ ...h, service: Service.RepairManagement }),
});

export const ThriftMerchantStatisticsService = createObservableService(MerchantStatisticsService, {
    headers: (h) => ({ ...h, service: Service.MerchantStatistics }),
});
