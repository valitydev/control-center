import { Injectable } from '@angular/core';
import { Machine, SearchRequest } from '@vality/repairer-proto';
import { map } from 'rxjs/operators';

import { RepairManagementService } from '../../../api/repairer';
import { PartialFetcher } from '../../../shared/services';

@Injectable()
export class MachinesService extends PartialFetcher<Machine, SearchRequest> {
    constructor(private repairManagementService: RepairManagementService) {
        super();
    }

    protected fetch(params: SearchRequest, continuationToken: string) {
        return this.repairManagementService
            .Search({ limit: 100, continuation_token: continuationToken, ...params })
            .pipe(
                map(({ machines, continuation_token }) => ({
                    result: machines,
                    continuationToken: continuation_token,
                }))
            );
    }
}
