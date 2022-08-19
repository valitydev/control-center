import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Version } from '@vality/domain-proto/lib/domain_config';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DomainModificationModel } from '../domain-modification-model';
import { DomainReviewService } from '../domain-review.service';
import { DomainService } from '../domain.service';

@Injectable()
export class DomainObjReviewService {
    constructor(
        private route: ActivatedRoute,
        private domainService: DomainService,
        private domainReviewService: DomainReviewService
    ) {}

    commit({ original, modified }: DomainModificationModel): Observable<Version> {
        const commit = {
            ops: [
                {
                    update: {
                        old_object: original.domainObj,
                        new_object: modified.domainObj,
                    },
                },
            ],
        };
        return this.domainService
            .commit(commit)
            .pipe(tap(() => this.domainReviewService.resetModel()));
    }

    initialize() {
        return combineLatest([this.route.params, this.domainReviewService.reviewModel]);
    }
}
