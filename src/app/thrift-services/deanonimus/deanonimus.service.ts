import { Injectable, NgZone } from '@angular/core';
import { SearchHit } from '@vality/deanonimus-proto';
import * as Deanonimus from '@vality/deanonimus-proto/lib/deanonimus/gen-nodejs/Deanonimus';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable({ providedIn: 'root' })
export class DeanonimusService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/deanonimus', Deanonimus);
    }

    searchParty = (text: string): Observable<SearchHit[]> =>
        this.toObservableAction('searchParty')(text);
}
