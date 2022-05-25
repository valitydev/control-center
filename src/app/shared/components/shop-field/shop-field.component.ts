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
import { PartyID, Shop, ShopID } from '@vality/domain-proto';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, defer, of } from 'rxjs';
import { filter, map, share, switchMap } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { ComponentChanges } from '@cc/app/shared/utils';
import { createControlProviders, ValidatedWrappedAbstractControlSuperclass } from '@cc/utils/forms';
import { RequiredSuper } from '@cc/utils/required-super';

@UntilDestroy()
@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    styleUrls: ['./shop-field.component.scss'],
    providers: createControlProviders(ShopFieldComponent),
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopFieldComponent<M extends boolean = boolean>
    extends ValidatedWrappedAbstractControlSuperclass<
        M extends true ? Shop[] : Shop,
        M extends true ? ShopID[] : ShopID
    >
    implements OnChanges, OnInit
{
    @Input() partyId: PartyID;
    @Input() @coerceBoolean multiple: M;
    @Input() @coerceBoolean required: boolean;

    control = new FormControl<M extends true ? ShopID[] : ShopID>();
    shops$ = defer(() => this.partyId$).pipe(
        switchMap((partyId) =>
            partyId
                ? this.partyManagementWithUserService
                      .getParty(partyId)
                      .pipe(map(({ shops }) => Array.from(shops.values())))
                : of<Shop[]>([])
        ),
        share()
    );

    private partyId$ = new BehaviorSubject<PartyID>(null);

    constructor(
        injector: Injector,
        private partyManagementWithUserService: PartyManagementWithUserService
    ) {
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
