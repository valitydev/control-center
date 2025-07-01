import { Injectable, inject } from '@angular/core';
import { Deanonimus, SearchWalletHit } from '@vality/deanonimus-proto/deanonimus';
import { FetchSuperclass } from '@vality/matez';
import { map } from 'rxjs/operators';

@Injectable()
export class FetchWalletsTextService extends FetchSuperclass<SearchWalletHit, string> {
    private deanonimusService = inject(Deanonimus);

    protected fetch(text: string) {
        return this.deanonimusService.searchWalletText(text).pipe(
            map((result) => ({
                result,
            })),
        );
    }
}
