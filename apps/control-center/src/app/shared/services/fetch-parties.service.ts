import { Injectable } from '@angular/core';
import { Party } from '@vality/deanonimus-proto/deanonimus';
import { FetchOptions, NotifyLogService, SingleFetchSuperclass, handleError } from '@vality/matez';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { DeanonimusService } from '../../api/deanonimus/deanonimus.service';

@Injectable()
export class FetchPartiesService extends SingleFetchSuperclass<Party, string> {
    constructor(
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(text: string, _options: FetchOptions) {
        return text
            ? this.deanonimusService.searchParty(text).pipe(
                  map((hits) => ({ result: hits.map((hit) => hit.party) })),
                  handleError(this.log.error, { result: [] }),
              )
            : of({ result: [] });
    }
}
