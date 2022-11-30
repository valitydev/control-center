import { Injectable, Injector } from '@angular/core';
import { Machine, MachineDescriptor, Reference } from '@vality/machinegun-proto';
import { Namespace } from '@vality/machinegun-proto/lib/base';
import * as Automaton from '@vality/machinegun-proto/lib/state_processing/gen-nodejs/Automaton';
import {
    MachineDescriptor as MachineDescriptorObject,
    Reference as ReferenceObject,
} from '@vality/machinegun-proto/lib/state_processing/gen-nodejs/state_processing_types';
import { Observable } from 'rxjs';

import { ThriftService } from '../utils/deprecated-thrift-service';

@Injectable()
export class AutomatonService extends ThriftService {
    constructor(injector: Injector) {
        super(injector, '/wachter', Automaton, 'Automaton');
    }

    simpleRepair = (ns: Namespace, ref: Reference): Observable<void> =>
        this.toObservableAction('SimpleRepair')(ns, new ReferenceObject(ref));

    getMachine = (desc: MachineDescriptor): Observable<Machine> =>
        this.toObservableAction('GetMachine')(new MachineDescriptorObject(desc));
}
