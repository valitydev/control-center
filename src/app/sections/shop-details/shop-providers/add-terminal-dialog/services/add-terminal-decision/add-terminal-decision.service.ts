import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PartyID, ProviderObject, ShopID } from '@vality/domain-proto/lib/domain';
import { merge, Observable, Subject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { AddDecisionToProvider, ProviderService } from '../../../../../../thrift-services/damsel';
import { DomainStoreService } from '../../../../../../thrift-services/damsel/domain-store.service';
import { addDecisionToProviderCommit } from '../../../../../../thrift-services/damsel/operations';
import {
    filterProvidersByCategoryId,
    filterProvidersByTerminalSelector,
} from '../../../../../../thrift-services/filters';

@Injectable()
export class AddTerminalDecisionService {
    private add$ = new Subject<{ shopID: ShopID; partyID: PartyID }>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    providerForm = this.prepareForm();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    terminalForm = this.prepareForm();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    error$ = new Subject();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    terminalAdded$ = this.add$.pipe(
        map((params) => ({
            ...params,
            providerID: this.providerForm.value.id,
            terminalID: this.terminalForm.value.id,
        })),
        switchMap((params) =>
            this.providerService.getProviderFromParams<AddDecisionToProvider>(params)
        ),
        switchMap(([params, providerObject]) =>
            this.domainStoreService.commit(addDecisionToProviderCommit(providerObject, params))
        ),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.add$, merge(this.terminalAdded$, this.error$));

    constructor(
        private domainStoreService: DomainStoreService,
        private providerService: ProviderService,
        private fb: UntypedFormBuilder
    ) {
        this.terminalAdded$.subscribe();
    }

    add(params: { shopID: ShopID; partyID: PartyID }) {
        this.add$.next(params);
    }

    getProviders(categoryID: number): Observable<ProviderObject[]> {
        return this.domainStoreService.getObjects('provider').pipe(
            map((objects) => filterProvidersByTerminalSelector(objects, 'decisions')),
            map((objects) => filterProvidersByCategoryId(objects, categoryID))
        );
    }

    private prepareForm(): UntypedFormGroup {
        return this.fb.group({
            id: ['', Validators.required],
        });
    }
}
