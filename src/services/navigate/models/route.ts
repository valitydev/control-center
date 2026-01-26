import { Overwrite } from 'utility-types';
import { ZodObject, ZodRawShape } from 'zod';

import { Route as NgRoute } from '@angular/router';

import { RoutingConfig, Service, canActivateAuthRole } from '../../app-auth-guard';

export class Route<
    const TPath extends string = string,
    TQpSchema extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>,
> {
    constructor(
        public readonly path: TPath,
        public readonly config: {
            services?: Service[];
            queryParams?: TQpSchema;
        } & NgRoute = {},
    ) {}

    getRoute(): Overwrite<NgRoute, { data: RoutingConfig }> {
        const { services, ...routeParams } = this.config;

        return {
            ...routeParams,
            path: this.path,
            canActivate: [canActivateAuthRole],
            data: { services },
        };
    }
}
