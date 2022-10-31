import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Shop } from '@vality/domain-proto';

@Component({
    selector: 'cc-shop-main-info',
    templateUrl: 'shop-main-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopMainInfoComponent {
    @Input() shop: Shop;
}
