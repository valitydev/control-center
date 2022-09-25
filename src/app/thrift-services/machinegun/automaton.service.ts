import { Injectable, NgZone } from '@angular/core';
import { Machine, MachineDescriptor, Reference } from '@vality/machinegun-proto';
import { Namespace } from '@vality/machinegun-proto/lib/base';
import * as Automaton from '@vality/machinegun-proto/lib/state_processing/gen-nodejs/Automaton';
import {
    MachineDescriptor as MachineDescriptorObject,
    Reference as ReferenceObject,
} from '@vality/machinegun-proto/lib/state_processing/gen-nodejs/state_processing_types';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
export class AutomatonService extends ThriftService {
    constructor(
        zone: NgZone,
        keycloakTokenInfoService: KeycloakTokenInfoService,
        keycloakService: KeycloakService
    ) {
        super(zone, keycloakTokenInfoService, keycloakService, '/v1/automaton', Automaton);
    }

    simpleRepair = (ns: Namespace, ref: Reference): Observable<void> =>
        this.toObservableAction('SimpleRepair')(ns, new ReferenceObject(ref));

    getMachine = (desc: MachineDescriptor): Observable<Machine> =>
        this.toObservableAction('GetMachine')(new MachineDescriptorObject(desc));
}
