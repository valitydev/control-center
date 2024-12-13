import { Injectable } from '@angular/core';
import { SearchWalletHit } from '@vality/deanonimus-proto/deanonimus';
import { FetchSuperclass } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { DeanonimusService } from '../../api/deanonimus';

@Injectable()
export class FetchWalletsTextService extends FetchSuperclass<SearchWalletHit, string> {
    constructor(private deanonimusService: DeanonimusService) {
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
