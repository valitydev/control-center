import { Component, ContentChild, Input, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ContentLoadingComponent } from '@vality/matez';

import { SidenavInfoService } from '../../sidenav-info.service';
import { CardActionsComponent } from '../card-actions/card-actions.component';

@Component({
    selector: 'cc-card',
    imports: [MatDividerModule, MatIconModule, ContentLoadingComponent],
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent {
    public sidenavInfoService = inject(SidenavInfoService);
    @Input() title: string;

    @ContentChild(CardActionsComponent) cardActionsComponent?: CardActionsComponent;
}
