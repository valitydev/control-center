import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import * as Repairer from '../../api/fistful/withdrawal-session/gen-nodejs/Repairer';
import { RepairScenario as RepairScenarioObject } from '../../api/fistful/withdrawal-session/gen-nodejs/withdrawal_session_types';
import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';
import { RepairScenario, SessionID } from './gen-model/withdrawal_session';

@Injectable()
export class RepairerService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/v1/repair/withdrawal/session', Repairer);
    }

    repair = (id: SessionID, scenario: RepairScenario): Observable<void> =>
        this.toObservableAction('Repair')(id, new RepairScenarioObject(scenario));
}
