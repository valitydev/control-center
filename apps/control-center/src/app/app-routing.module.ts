import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from './shared/services';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    redirectTo: '/payments',
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
