import { z } from 'zod';

import { Route, Services } from './shared/services';

type SectionPageRoutes = { [KSection: string]: { [KPage: string]: Route } };

export const APP_ROUTES = {
    domain2: {
        root: new Route('domain2', {
            services: [Services.Domain],
            loadChildren: () => import('./sections/domain2').then((m) => m.DomainModule),
            queryParams: z.object({ type: z.string() }),
        }),
    },
} satisfies SectionPageRoutes;
