import { NgModule } from '@angular/core';

import { CardComponent } from './components/card/card.component';
import { CardActionsComponent } from './components/card-actions/card-actions.component';
import { SidenavInfoComponent } from './sidenav-info.component';

@NgModule({
    imports: [CardComponent, CardActionsComponent, SidenavInfoComponent],
    exports: [CardComponent, CardActionsComponent, SidenavInfoComponent],
})
export class SidenavInfoModule {}
