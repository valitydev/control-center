import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';
import { hasActiveFragments } from '@cc/utils/has-active-fragments';

import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from '../deposits/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from '../search-payments/routing-config';

@Component({
    templateUrl: 'operations.component.html',
    styleUrls: ['operations.component.scss'],
})
export class OperationsComponent {
    links = this.getLinks();

    constructor(private router: Router, private appAuthGuardService: AppAuthGuardService) {}

    hasActiveFragments(fragments: string[]): boolean {
        const ulrFragments = this.router.url.split('/');
        return hasActiveFragments(fragments, ulrFragments);
    }

    private getLinks() {
        const links = [
            {
                name: 'Payments',
                url: 'payments',
                otherActiveUrlFragments: ['payment'],
                services: PAYMENTS_ROUTING_CONFIG.services,
            },
            {
                name: 'Deposits',
                url: 'deposits',
                otherActiveUrlFragments: ['deposit'],
                services: DEPOSITS_ROUTING_CONFIG.services,
            },
        ];
        return links.filter((item) =>
            this.appAuthGuardService.userHasSomeServiceMethods(item.services)
        );
    }
}
