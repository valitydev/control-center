import { ChangeDetectionStrategy, Component, Injector, Input, OnChanges } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, defer, of } from 'rxjs';
import { share, switchMap } from 'rxjs/operators';

import { Party, Shop } from '@cc/app/api/damsel/gen-model/domain';
import { ComponentChanges } from '@cc/app/shared/utils';
import {
    createValidatedAbstractControlProviders,
    ValidatedWrappedAbstractControlSuperclass,
} from '@cc/utils/forms';

import { PartyService } from '../../../papi/party.service';

@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    styleUrls: ['./shop-field.component.scss'],
    providers: createValidatedAbstractControlProviders(ShopFieldComponent),
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopFieldComponent<M extends boolean = boolean>
    extends ValidatedWrappedAbstractControlSuperclass<
        M extends true ? Shop[] : Shop,
        M extends true ? Shop['id'][] : Shop['id']
    >
    implements OnChanges {
    @Input() partyId: Party['id'];
    @Input() @coerceBoolean multiple: M;
    @Input() @coerceBoolean required: boolean;

    control = new FormControl<M extends true ? Shop['id'][] : Shop['id']>();
    shops$ = defer(() => this.partyId$).pipe(
        switchMap((partyId) => (partyId ? this.partyService.getShops(partyId) : of([]))),
        share()
    );

    private partyId$ = new BehaviorSubject<Party['id']>(null);

    constructor(injector: Injector, private partyService: PartyService) {
        super(injector);
    }

    ngOnChanges(changes: ComponentChanges<ShopFieldComponent>): void {
        super.ngOnChanges(changes);
        if (changes.partyId) {
            this.partyId$.next(changes.partyId.currentValue);
        }
    }
}
