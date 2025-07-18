import { z } from 'zod';

import { Route, Services } from './shared/services';

type SectionPageRoutes = { [KSection: string]: { [KPage: string]: Route } };

export const APP_ROUTES = {
    domain: {
        root: new Route('domain', {
            services: [Services.DMT],
            loadComponent: () => import('./domain-config').then((m) => m.DomainConfigComponent),
            queryParams: z.object({ type: z.string() }),
        }),
    },
    parties: {
        root: new Route('parties', {
            services: [Services.DMT],
            loadComponent: () => import('./parties').then((m) => m.PartiesComponent),
            queryParams: z.object({ type: z.string() }),
        }),
    },
} satisfies SectionPageRoutes;
