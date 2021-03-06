import { Injectable, NgZone } from '@angular/core';
import { DepositParams } from '@vality/fistful-proto/lib/fistful_admin';
import { DepositParams as DepositParamsObject } from '@vality/fistful-proto/lib/fistful_admin/gen-nodejs/fistful_admin_types';
import * as FistfulAdmin from '@vality/fistful-proto/lib/fistful_admin/gen-nodejs/FistfulAdmin';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
export class FistfulAdminService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/v1/admin', FistfulAdmin);
    }

    createDeposit(params: DepositParams): Observable<void> {
        return this.toObservableAction('CreateDeposit')(new DepositParamsObject(params));
    }
}
