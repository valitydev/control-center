import { Injectable, NgZone } from '@angular/core';
import {
    Commit,
    Limit,
    Reference,
    Snapshot,
    Version,
} from '@vality/domain-proto/lib/domain_config';
import * as Repository from '@vality/domain-proto/lib/domain_config/gen-nodejs/Repository';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
/** @deprecated use thrift service from api dir */
export class DomainService extends ThriftService {
    checkout: (reference: Reference) => Observable<Snapshot> = this.toObservableAction(
        'Checkout',
        false
    );

    commit: (version: Version, commit: Commit) => Observable<Version> = this.toObservableAction(
        'Commit',
        false
    );

    pullRange: (after: Version, limit: Limit) => Observable<History> = this.toObservableAction(
        'PullRange',
        false
    );

    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/v1/domain/repository', Repository);
    }
}
