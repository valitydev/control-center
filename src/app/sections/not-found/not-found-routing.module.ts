import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ErrorPageComponent } from '@vality/matez';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ErrorPageComponent,
            },
        ]),
    ],
})
export class NotFoundRoutingModule {}
