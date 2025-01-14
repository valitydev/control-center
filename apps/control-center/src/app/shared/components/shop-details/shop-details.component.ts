import { Component, Input } from '@angular/core';
import { Shop } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-shop-details',
    templateUrl: 'shop-details.component.html',
    standalone: false,
})
export class ShopDetailsComponent {
    @Input() shop: Shop;
}
