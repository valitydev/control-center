import { ChangeDetectionStrategy, Component, OnInit, Injector } from '@angular/core';
import { magista } from '@vality/magista-proto';
import { DialogSuperclass } from '@vality/ng-core';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

import { getEnumKeyValues } from '../../../../../../utils';
import { SearchFiltersParams } from '../../search-filters-params';
import { OtherFiltersDialogService } from './other-filters-dialog.service';

@Component({
    templateUrl: 'other-filters-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [OtherFiltersDialogService],
})
export class OtherFiltersDialogComponent
    extends DialogSuperclass<OtherFiltersDialogComponent, SearchFiltersParams, SearchFiltersParams>
    implements OnInit
{
    paymentStatuses = getEnumKeyValues(magista.InvoicePaymentStatus);
    paymentMethods = getEnumKeyValues(magista.PaymentToolType);
    tokenProviders$ = this.domainStoreService.getObjects('payment_token');
    paymentSystems$ = this.domainStoreService.getObjects('payment_system');

    currentDomainVersion$ = this.paymentsOtherSearchFiltersService.currentDomainVersion$;
    form = this.paymentsOtherSearchFiltersService.form;

    constructor(
        injector: Injector,
        private paymentsOtherSearchFiltersService: OtherFiltersDialogService,
        private domainStoreService: DomainStoreService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.form.patchValue(this.dialogData);
    }

    save() {
        this.closeWithSuccess(this.form.value);
    }
}
