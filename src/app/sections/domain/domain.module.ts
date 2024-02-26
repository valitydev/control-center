import { NgModule } from '@angular/core';

import { DomainInfoModule } from './domain-info';
import { DomainRoutingModule } from './domain-routing.module';
import { MetadataService } from './services/metadata.service';
import { ModifiedDomainObjectService } from './services/modified-domain-object.service';

@NgModule({
    imports: [DomainRoutingModule, DomainInfoModule],
    providers: [MetadataService, ModifiedDomainObjectService],
})
export class DomainModule {}
