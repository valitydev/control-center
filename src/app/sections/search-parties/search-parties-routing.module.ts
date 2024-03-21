import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { SearchPartiesComponent } from './search-parties.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'parties',
                component: SearchPartiesComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
            {
                path: 'party',
                redirectTo: 'parties',
            },
        ]),
    ],
    exports: [RouterModule],
})
export class SearchPartiesRoutingModule {}
