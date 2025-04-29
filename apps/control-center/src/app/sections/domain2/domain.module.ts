import { NgModule } from '@angular/core';

import { DomainRoutingModule } from './domain-routing.module';
import { MetadataService } from './services/metadata.service';

@NgModule({
    imports: [DomainRoutingModule],
    providers: [MetadataService],
})
export class DomainModule {}
