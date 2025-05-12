import { LoadChildren, Route as NgRoute } from '@angular/router';
import { Overwrite } from 'utility-types';
import { ZodObject, ZodRawShape } from 'zod';

import { AppAuthGuardService, RoutingConfig, Services } from '../../app-auth-guard';

export class Route<
    const TPath extends string = string,
    TQpSchema extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>,
> {
    constructor(
        public readonly path: TPath,
        public readonly config: {
            services?: Services[];
            queryParams?: TQpSchema;
            loadChildren?: LoadChildren;
        } = {},
    ) {}

    getRoute(): Overwrite<NgRoute, { data: RoutingConfig }> {
        return {
            path: this.path,
            loadChildren: this.config.loadChildren,
            canActivate: [AppAuthGuardService],
            data: { services: this.config.services },
        };
    }
}
