import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';

import { Repository2Service } from '../repository2.service';

@Injectable({
    providedIn: 'root',
})
export class Domain2StoreService {
    version$ = this.repositoryService
        .GetLatestVersion()
        .pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    constructor(private repositoryService: Repository2Service) {}
}
