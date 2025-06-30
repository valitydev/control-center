import { Injectable, inject } from '@angular/core';
import { Deanonimus, Party } from '@vality/deanonimus-proto/deanonimus';
import { FetchOptions, NotifyLogService, SingleFetchSuperclass, handleError } from '@vality/matez';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class FetchPartiesService extends SingleFetchSuperclass<Party, string> {
    private deanonimusService = inject(Deanonimus);
    private log = inject(NotifyLogService);

    protected fetch(text: string, _options: FetchOptions) {
        return text
            ? this.deanonimusService.searchParty(text).pipe(
                  map((hits) => ({ result: hits.map((hit) => hit.party) })),
                  handleError(this.log.error, { result: [] }),
              )
            : of({ result: [] });
    }
}
