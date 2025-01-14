import { Injectable } from '@angular/core';
import {
    ThriftAstMetadata,
    state_processing_Automaton,
    state_processing_AutomatonCodegenClient,
} from '@vality/machinegun-proto';
import { Args, MachineDescriptor } from '@vality/machinegun-proto/state_processing';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class AutomatonService {
    private client$: Observable<state_processing_AutomatonCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('Automaton')),
        );
        const metadata$ = from(
            import('@vality/machinegun-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                state_processing_Automaton({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    Call(desc: MachineDescriptor, a: Args) {
        return this.client$.pipe(switchMap((c) => c.Call(desc, a)));
    }
}
