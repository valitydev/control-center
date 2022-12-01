import { Injectable, Injector } from '@angular/core';
import { RepairScenario, SessionID } from '@vality/fistful-proto/lib/withdrawal_session';
import * as Repairer from '@vality/fistful-proto/lib/withdrawal_session/gen-nodejs/Repairer';
import { RepairScenario as RepairScenarioObject } from '@vality/fistful-proto/lib/withdrawal_session/gen-nodejs/withdrawal_session_types';
import { Observable } from 'rxjs';

import { DeprecatedThriftService } from '@cc/app/api/utils/deprecated-thrift-service';

@Injectable()
export class RepairerService extends DeprecatedThriftService {
    constructor(injector: Injector) {
        super(injector, '/wachter', Repairer, 'Repairer');
    }

    repair = (id: SessionID, scenario: RepairScenario): Observable<void> =>
        this.toObservableAction('Repair')(id, new RepairScenarioObject(scenario));
}