import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getEnumValues } from '@vality/matez';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { RoutingRulesType } from './types/routing-rules-type';

@Injectable()
export class RoutingRulesTypeService {
    routingRulesType$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map((p) => (getEnumValues(RoutingRulesType).includes(p['type']) ? p['type'] : null)),
    ) as Observable<RoutingRulesType>;

    constructor(private route: ActivatedRoute) {}
}
