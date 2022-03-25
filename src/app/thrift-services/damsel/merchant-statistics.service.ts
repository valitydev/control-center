import { Injectable, NgZone } from '@angular/core';
import { StatRequest, StatResponse } from '@vality/domain-proto/lib/merch_stat';
import { StatRequest as ThriftStatRequest } from '@vality/domain-proto/lib/merch_stat/gen-nodejs/merch_stat_types';
import * as MerchantStatistics from '@vality/domain-proto/lib/merch_stat/gen-nodejs/MerchantStatistics';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
export class MerchantStatisticsService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/stat', MerchantStatistics);
    }

    getPayments = (req: StatRequest): Observable<StatResponse> =>
        this.toObservableAction('GetPayments')(new ThriftStatRequest(req));

    getStatistics = (req: StatRequest): Observable<StatResponse> =>
        this.toObservableAction('GetStatistics')(new ThriftStatRequest(req));
}
