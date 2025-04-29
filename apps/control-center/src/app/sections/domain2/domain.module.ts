import { NgModule } from '@angular/core';

import { DomainInfoModule } from './domain-objects';
import { DomainRoutingModule } from './domain-routing.module';
import { MetadataService } from './services/metadata.service';

@NgModule({
    imports: [DomainRoutingModule, DomainInfoModule],
    providers: [MetadataService],
})
export class DomainModule {}
