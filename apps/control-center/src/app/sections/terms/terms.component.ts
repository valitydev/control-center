import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Link, NavComponent } from '@vality/matez';

import { SidenavInfoService } from '../../shared/components/sidenav-info/sidenav-info.service';

@Component({
    selector: 'cc-terms',
    imports: [CommonModule, RouterOutlet, MatSidenavModule, NavComponent],
    templateUrl: './terms.component.html',
})
export class TermsComponent {
    public sidenavInfoService = inject(SidenavInfoService);
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
}
