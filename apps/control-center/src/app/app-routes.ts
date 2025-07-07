import { z } from 'zod';

import { Route, Services } from './shared/services';

type SectionPageRoutes = { [KSection: string]: { [KPage: string]: Route } };

export const APP_ROUTES = {
    domain: {
        root: new Route('domain', {
            services: [Services.Domain],
            loadComponent: () => import('./domain-config').then((m) => m.DomainObjectsComponent),
            queryParams: z.object({ type: z.string() }),
        }),
    },
} satisfies SectionPageRoutes;
