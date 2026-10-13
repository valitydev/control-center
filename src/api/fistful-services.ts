import { loadThriftMetadataByNamespaces } from '@vality/fistful-proto';
import { Management as DepositManagement } from '@vality/fistful-proto/deposit';
import { Management as DestinationManagement } from '@vality/fistful-proto/destination';
import { FistfulStatistics } from '@vality/fistful-proto/fistful_stat';
import { Management as SourceManagement } from '@vality/fistful-proto/source';
import { WebhookManager as WalletsWebhookManager } from '@vality/fistful-proto/webhooker';
import { Management as WithdrawalManagement } from '@vality/fistful-proto/withdrawal';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';

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
    return loadThriftMetadataByNamespaces([
        'deposit',
        'destination',
        'fistful_stat',
        'source',
        'withdrawal',
        'webhooker',
    ]);
}
