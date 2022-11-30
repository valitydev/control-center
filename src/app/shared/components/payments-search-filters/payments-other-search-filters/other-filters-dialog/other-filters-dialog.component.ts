import { ChangeDetectionStrategy, Component, OnInit, Injector } from '@angular/core';
import { PaymentToolType, InvoicePaymentStatus } from '@vality/magista-proto';
import { BaseDialogSuperclass } from '@vality/ng-core';

import { getEnumKeyValues } from '../../../../../../utils';
import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { SearchFiltersParams } from '../../search-filters-params';
import { OtherFiltersDialogService } from './other-filters-dialog.service';

@Component({
    templateUrl: 'other-filters-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [OtherFiltersDialogService],
})
export class OtherFiltersDialogComponent
    extends BaseDialogSuperclass<
        OtherFiltersDialogComponent,
        SearchFiltersParams,
        SearchFiltersParams
    >
    implements OnInit
{
    paymentStatuses = getEnumKeyValues(InvoicePaymentStatus);
    paymentMethods = getEnumKeyValues(PaymentToolType);
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
