import { NgModule } from '@angular/core';
import { ErrorPageModule } from '@vality/matez';

import { NotFoundRoutingModule } from './not-found-routing.module';

@NgModule({
    imports: [ErrorPageModule, NotFoundRoutingModule],
})
export class NotFoundModule {}
