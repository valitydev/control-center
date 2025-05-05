import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ExtractParams, serializeQueryParams } from '@vality/matez';
import { difference, pick } from 'lodash-es';
import { ZodObject, ZodRawShape, z } from 'zod';

import { Services } from './shared/services';

class Route<
    const TPath extends string = string,
    TQpSchema extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>,
> {
    constructor(
        public readonly path: TPath,
        public readonly config: { services?: Services[]; queryParams?: TQpSchema } = {},
    ) {}
}

type SectionPageRoutes = { [KSection: string]: { [KPage: string]: Route } };

export const APP_ROUTES = {
    domain2: {
        root: new Route('/domain2', {
            services: [Services.Domain],
            queryParams: z.object({ type: z.string() }),
        }),
    },
} satisfies SectionPageRoutes;

const PATH_PARAM_REGEX = /:[a-zA-Z0-9_]+/g;

@Injectable({ providedIn: 'root' })
export class AppNavigateService {
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
        return this.router.navigate([resultPath], {
            queryParams: serializeQueryParams(queryParams),
        });
    }
}
