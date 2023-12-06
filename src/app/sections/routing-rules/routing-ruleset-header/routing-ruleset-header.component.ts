import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { SidenavInfoService } from '../../../shared/components/sidenav-info';
import { DomainObjectCardComponent } from '../../../shared/components/thrift-api-crud';

@Component({
    selector: 'cc-routing-ruleset-header',
    templateUrl: 'routing-ruleset-header.component.html',
    styleUrls: ['routing-ruleset-header.component.scss'],
})
export class RoutingRulesetHeaderComponent {
    @Input() refID: string;
    @Input() description?: string;
    @Input() backTo?: string;

    @Output() add = new EventEmitter();

    get queryParams() {
        return {
            types: JSON.stringify(['RoutingRulesObject']),
            sidenav: JSON.stringify({
                id: 'domainObject',
                inputs: { ref: { routing_rules: { id: this.refID } } },
            }),
        };
    }

    constructor(
        private router: Router,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    navigateBack() {
        void this.router.navigate([this.backTo]);
    }

    openRule() {
        this.sidenavInfoService.toggle(DomainObjectCardComponent, {
            ref: { routing_rules: { id: Number(this.refID) } },
        });
    }
}
