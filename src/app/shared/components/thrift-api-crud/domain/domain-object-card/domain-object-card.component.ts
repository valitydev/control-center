import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject } from '@vality/domain-proto/domain';
import { Reference } from '@vality/domain-proto/internal/domain';

import { CardComponent } from '../../../sidenav-info/components/card/card.component';
import { CardActionsComponent } from '../../../sidenav-info/components/card-actions/card-actions.component';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';
import { DomainObjectService } from '../services/domain-object.service';
import { getDomainObjectDetails } from '../utils';

@Component({
    selector: 'cc-domain-object-card',
    standalone: true,
    imports: [
        CommonModule,
        DomainThriftViewerComponent,
        CardComponent,
        CardActionsComponent,
        MatButtonModule,
    ],
    templateUrl: './domain-object-card.component.html',
})
export class DomainObjectCardComponent {
    @Input() domainObject: DomainObject;
    @Input() ref: Reference;
    @Input() progress: boolean;

    get title() {
        return getDomainObjectDetails(this.domainObject)?.label;
    }

    constructor(private domainObjectService: DomainObjectService) {}

    edit() {
        void this.domainObjectService.edit(this.ref);
    }

    delete() {
        this.domainObjectService.delete(this.domainObject);
    }
}
