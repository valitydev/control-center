import { NgModule } from '@angular/core';

import { DomainInfoModule } from './domain-info/domain-info.module';
import { DomainObjModificationModule } from './domain-obj-modification';
import { DomainObjReviewModule } from './domain-obj-review';
import { DomainRoutingModule } from './domain-routing.module';
import { DomainService } from './domain.service';
import { MetadataService } from './services/metadata.service';
import { ModifiedDomainObjectService } from './services/modified-domain-object.service';

@NgModule({
    imports: [
        DomainRoutingModule,
        DomainInfoModule,
        DomainObjModificationModule,
        DomainObjReviewModule,
    ],
    providers: [DomainService, MetadataService, ModifiedDomainObjectService],
})
export class DomainModule {}
