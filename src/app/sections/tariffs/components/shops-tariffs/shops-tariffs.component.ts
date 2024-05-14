import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiltersModule } from '@vality/ng-core';

import { PageLayoutModule } from '@cc/app/shared';
import { CurrencyFieldComponent } from '@cc/app/shared/components/currency-field';

@Component({
    selector: 'cc-shops-tariffs',
    standalone: true,
    imports: [AsyncPipe, CurrencyFieldComponent, FiltersModule, FormsModule, PageLayoutModule],
    templateUrl: './shops-tariffs.component.html',
})
export class ShopsTariffsComponent {}
