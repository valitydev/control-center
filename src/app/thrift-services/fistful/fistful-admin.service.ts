import { Injectable, Injector } from '@angular/core';
import { DepositParams } from '@vality/fistful-proto/lib/fistful_admin';
import { DepositParams as DepositParamsObject } from '@vality/fistful-proto/lib/fistful_admin/gen-nodejs/fistful_admin_types';
import * as FistfulAdmin from '@vality/fistful-proto/lib/fistful_admin/gen-nodejs/FistfulAdmin';
import { Observable } from 'rxjs';

import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
export class FistfulAdminService extends ThriftService {
    constructor(injector: Injector) {
        super(injector, '/wachter', FistfulAdmin, 'FistfulAdmin');
    }

    createDeposit(params: DepositParams): Observable<void> {
        return this.toObservableAction('CreateDeposit')(new DepositParamsObject(params));
    }
}
