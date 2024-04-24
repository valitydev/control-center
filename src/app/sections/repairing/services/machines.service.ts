import { Injectable } from '@angular/core';
import { FetchSuperclass, NotifyLogService, FetchOptions } from '@vality/ng-core';
import { Machine, SearchRequest } from '@vality/repairer-proto/repairer';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { RepairManagementService } from '../../../api/repairer';

@Injectable()
export class MachinesService extends FetchSuperclass<Machine, SearchRequest> {
    constructor(
        private repairManagementService: RepairManagementService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(params: SearchRequest, options: FetchOptions) {
        return this.repairManagementService
            .Search({
                limit: options.size,
                continuation_token: options.continuationToken,
                ...params,
            })
            .pipe(
                map(({ machines, continuation_token }) => ({
                    result: machines,
                    continuationToken: continuation_token,
                })),
                catchError((err) => {
                    this.log.error(err);
                    return of({ result: [] });
                }),
            );
    }
}
