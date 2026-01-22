import { z } from 'zod';

import { Route, Service } from '~/services';

type SectionPageRoutes = Record<string, Record<string, Route>>;

export const APP_ROUTES = {
    domain: {
        root: new Route('domain', {
            services: [Service.DMT],
            loadComponent: () => import('./domain-config').then((m) => m.DomainConfigComponent),
            queryParams: z.object({ type: z.string() }),
        }),
    },
    parties: {
        root: new Route('parties', {
            services: [Service.DMT],
            loadComponent: () => import('./parties').then((m) => m.PartiesComponent),
            queryParams: z.object({ type: z.string() }),
        }),
    },
} satisfies SectionPageRoutes;
