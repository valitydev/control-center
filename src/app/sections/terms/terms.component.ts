import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Link, NavComponent } from '@vality/ng-core';

import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';

@Component({
    selector: 'cc-terms',
    standalone: true,
    imports: [CommonModule, RouterOutlet, MatSidenavModule, NavComponent],
    templateUrl: './terms.component.html',
})
export class TermsComponent {
    links: Link[] = [
        {
            label: 'Shops',
            url: 'shops',
        },
        {
            label: 'Wallets',
            url: 'wallets',
        },
        {
            label: 'Terminals',
            url: 'terminals',
        },
    ];

    constructor(public sidenavInfoService: SidenavInfoService) {}
}
