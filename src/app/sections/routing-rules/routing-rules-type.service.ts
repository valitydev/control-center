import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { RoutingRulesType } from './types/routing-rules-type';

@Injectable()
export class RoutingRulesTypeService {
    routingRulesType$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map((p) => p.type),
    ) as Observable<RoutingRulesType>;

    constructor(private route: ActivatedRoute) {}
}
