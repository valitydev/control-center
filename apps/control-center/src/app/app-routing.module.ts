import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { APP_ROUTES } from './app-routes';
import { AppAuthGuardService } from './shared/services';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                APP_ROUTES.domain2.root.getRoute(),
                {
                    path: '',
                    redirectTo: '/domain',
                    pathMatch: 'full',
                },
            ],
            {
                paramsInheritanceStrategy: 'always',
            },
        ),
    ],
    providers: [AppAuthGuardService],
    exports: [RouterModule],
})
export class AppRoutingModule {}
