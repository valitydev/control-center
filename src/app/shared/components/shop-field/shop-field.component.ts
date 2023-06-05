import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Shop } from '@vality/domain-proto/domain';
import { PartyID, ShopID } from '@vality/domain-proto/payment_processing';
import { createControlProviders, FormControlSuperclass, setDisabled } from '@vality/ng-core';
import { coerceBoolean } from 'coerce-property';
import { BehaviorSubject, defer, of } from 'rxjs';
import { filter, map, share, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { ComponentChanges } from '@cc/app/shared/utils';

@UntilDestroy()
@Component({
    selector: 'cc-shop-field',
    templateUrl: './shop-field.component.html',
    styleUrls: ['./shop-field.component.scss'],
    providers: createControlProviders(() => ShopFieldComponent),
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopFieldComponent<M extends boolean = boolean>
    extends FormControlSuperclass<
        M extends true ? Shop[] : Shop,
        M extends true ? ShopID[] : ShopID
    >
    implements OnChanges, OnInit
{
    @Input() partyId: PartyID;
    @Input() @coerceBoolean multiple: M;
    @Input() @coerceBoolean required: boolean;

    shops$ = defer(() => this.partyId$).pipe(
        switchMap((partyId) =>
            partyId
                ? this.partyManagementService
                      .Get(partyId)
                      .pipe(map(({ shops }) => Array.from(shops.values())))
                : of<Shop[]>([])
        ),
        share()
    );

    private partyId$ = new BehaviorSubject<PartyID>(null);

    constructor(private partyManagementService: PartyManagementService) {
        super();
    }

    setDisabledState(isDisabled: boolean) {
        super.setDisabledState(!this.partyId || isDisabled);
    }

    ngOnChanges(changes: ComponentChanges<ShopFieldComponent>): void {
        super.ngOnChanges(changes);
        if (changes.partyId) {
            this.partyId$.next(changes.partyId.currentValue);
            setDisabled(this.control, !this.partyId);
        }
    }

    ngOnInit() {
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
        super.ngOnInit();
    }
}
