import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import { FetchOptions, FetchSuperclass, NotifyLogService } from '@vality/matez';
import { Machine, SearchRequest } from '@vality/repairer-proto/repairer';

import { ThriftRepairManagementService } from '~/api/services';

@Injectable()
export class MachinesService extends FetchSuperclass<Machine, SearchRequest> {
    private repairManagementService = inject(ThriftRepairManagementService);
    private log = inject(NotifyLogService);

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
