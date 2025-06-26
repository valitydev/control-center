import { Injectable, inject } from '@angular/core';
import { SearchWalletHit } from '@vality/deanonimus-proto/deanonimus';
import { FetchSuperclass } from '@vality/matez';
import { map } from 'rxjs/operators';

import { DeanonimusService } from '../../api/deanonimus';

@Injectable()
export class FetchWalletsTextService extends FetchSuperclass<SearchWalletHit, string> {
    private deanonimusService = inject(DeanonimusService);

    constructor() {
        super();
    }

    protected fetch(text: string) {
        return this.deanonimusService.searchWalletText(text).pipe(
            map((result) => ({
                result,
            })),
        );
    }
}
