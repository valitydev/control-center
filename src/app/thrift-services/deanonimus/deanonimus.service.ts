import { Injectable, Injector } from '@angular/core';
import { SearchHit } from '@vality/deanonimus-proto';
import * as Deanonimus from '@vality/deanonimus-proto/lib/deanonimus/gen-nodejs/Deanonimus';
import { Observable } from 'rxjs';

import { ThriftService } from '../services/thrift/thrift-service';

@Injectable({ providedIn: 'root' })
export class DeanonimusService extends ThriftService {
    constructor(injector: Injector) {
        super(injector, '/wachter', Deanonimus, 'Deanonimus');
    }

    searchParty = (text: string): Observable<SearchHit[]> =>
        this.toObservableAction('searchParty')(text);
}
