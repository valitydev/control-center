import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ExtractParams, serializeQueryParams } from '@vality/matez';
import { difference, pick } from 'lodash-es';
import { z } from 'zod';

import { Route } from './models/route';

const PATH_PARAM_REGEX = /:[a-zA-Z0-9_]+/g;

@Injectable({ providedIn: 'root' })
export class NavigateService {
    constructor(private router: Router) {}

    navigate<T extends Route>(
        route: T,
        params: ExtractParams<T['path']> & z.infer<T['config']['queryParams']>,
    ) {
        const pathParams = (route.path.match(PATH_PARAM_REGEX) || []).map((param) =>
            param.slice(1),
        );
        const queryParams = pick(params, difference(Object.keys(params), pathParams));
        const resultPath = route.path;
        for (const param of pathParams) {
            resultPath.replace(`:${param}`, params[param]);
        }
        return this.router.navigate(['/', resultPath], {
            queryParams: serializeQueryParams(queryParams),
        });
    }
}
