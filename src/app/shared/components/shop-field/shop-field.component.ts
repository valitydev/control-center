import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnChanges,
    OnInit,
} from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, defer, of } from 'rxjs';
import { filter, share, switchMap } from 'rxjs/operators';

import { Party, Shop } from '@cc/app/api/damsel/gen-model/domain';
import { ComponentChanges } from '@cc/app/shared/utils';
import {
    createValidatedAbstractControlProviders,
    ValidatedWrappedAbstractControlSuperclass,
} from '@cc/utils/forms';
import { RequiredSuper } from '@cc/utils/required-super';

import { PartyService } from '../../../papi/party.service';

@UntilDestroy()
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
    implements OnChanges, OnInit {
    @Input() partyId: Party['id'];
    @Input() @coerceBoolean multiple: M;
    @Input() @coerceBoolean required: boolean;

    control = new FormControl<M extends true ? Shop['id'][] : Shop['id']>();
    shops$ = defer(() => this.partyId$).pipe(
        switchMap((partyId) => (partyId ? this.partyService.getShops(partyId) : of([] as Shop[]))),
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

    ngOnInit(): RequiredSuper {
        this.shops$
            .pipe(
                filter(
                    (shops) => this.control.value && !shops.find((s) => s.id === this.control.value)
                ),
                untilDestroyed(this)
            )
            .subscribe(() => {
                this.control.setValue(null);
            });
        return super.ngOnInit();
    }
}
