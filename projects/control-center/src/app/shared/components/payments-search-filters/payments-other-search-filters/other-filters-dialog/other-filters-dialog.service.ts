import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';

import { DomainStoreService } from '../../../../../thrift-services/damsel/domain-store.service';

@Injectable()
export class OtherFiltersDialogService {
    currentDomainVersion$ = this.domainStoreService.version$;

    form = this.fb.group({
        payerEmail: ['', [Validators.email]],
        terminalID: '',
        providerID: '',
        paymentStatus: null,
        domainRevisionFrom: '',
        domainRevisionTo: '',
        paymentAmountFrom: '',
        paymentAmountTo: '',
        paymentMethod: null,
        tokenProvider: null,
        paymentSystem: null,
    });

    constructor(private fb: UntypedFormBuilder, private domainStoreService: DomainStoreService) {}
}
