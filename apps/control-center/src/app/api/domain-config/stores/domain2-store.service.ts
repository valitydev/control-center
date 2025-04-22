import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Operation, Version } from '@vality/domain-proto/domain_config_v2';

import { Repository2Service } from '../repository2.service';

import { AuthorStoreService } from './author-store.service';

@Injectable({
    providedIn: 'root',
})
export class Domain2StoreService {
    version = rxResource({ loader: () => this.repositoryService.GetLatestVersion() });

    constructor(
        private repositoryService: Repository2Service,
        private authorStoreService: AuthorStoreService,
    ) {}

    commit(ops: Operation[], version: Version = this.version.value()) {
        return this.repositoryService.Commit(
            version,
            ops,
            this.authorStoreService.author.value().id,
        );
    }
}
