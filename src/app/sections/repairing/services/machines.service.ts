import { Injectable } from '@angular/core';
import { Machine, SearchRequest } from '@vality/repairer-proto/repairer';
import { map } from 'rxjs/operators';

import { RepairManagementService } from '../../../api/repairer';
import { PartialFetcher } from '../../../shared/services';
import { NotificationErrorService } from '../../../shared/services/notification-error';

@Injectable()
export class MachinesService extends PartialFetcher<Machine, SearchRequest> {
    constructor(
        private repairManagementService: RepairManagementService,
        private notificationErrorService: NotificationErrorService
    ) {
        super();
    }

    protected fetch(params: SearchRequest, continuationToken: string, size: number) {
        return this.repairManagementService
            .Search({ limit: size, continuation_token: continuationToken, ...params })
            .pipe(
                map(({ machines, continuation_token }) => ({
                    result: machines,
                    continuationToken: continuation_token,
                }))
            );
    }

    protected handleError(err) {
        this.notificationErrorService.error(err);
    }
}
