import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

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

    get queryRef() {
        return JSON.stringify({ routing_rules: { id: this.refID } });
    }

    get queryTypes() {
        return JSON.stringify(['RoutingRulesObject']);
    }

    constructor(private router: Router) {}

    navigateBack() {
        void this.router.navigate([this.backTo]);
    }
}
