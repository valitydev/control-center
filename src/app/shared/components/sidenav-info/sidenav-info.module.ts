import { NgModule } from '@angular/core';

import { CardComponent } from './components/card/card.component';
import { CardActionsComponent } from './components/card-actions/card-actions.component';

@NgModule({
    imports: [CardComponent, CardActionsComponent],
})
export class SidenavInfoModule {}
