import { Component, Input } from '@angular/core';
import { Contract } from '@vality/domain-proto';

@Component({
    selector: 'cc-shop-contract-info',
    templateUrl: './shop-contract-info.component.html',
})
export class ShopContractInfoComponent {
    @Input() contract?: Contract;
}
