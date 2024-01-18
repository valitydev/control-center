import { NgModule } from '@angular/core';

import { DomainInfoModule } from './domain-info';
import { DomainRoutingModule } from './domain-routing.module';
import { ModifiedDomainObjectService } from './services/modified-domain-object.service';

@NgModule({
    imports: [DomainRoutingModule, DomainInfoModule],
    providers: [ModifiedDomainObjectService],
})
export class DomainModule {}
