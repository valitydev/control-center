import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnInit,
    booleanAttribute,
    DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Shop } from '@vality/domain-proto/domain';
import { PartyID, ShopID } from '@vality/domain-proto/payment_processing';
import {
    createControlProviders,
    FormControlSuperclass,
    setDisabled,
    isEmpty,
    ComponentChanges,
} from '@vality/ng-core';
import { BehaviorSubject, defer, of } from 'rxjs';
import { filter, map, share, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

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
    @Input({ transform: booleanAttribute }) multiple: M;
    @Input({ transform: booleanAttribute }) required: boolean;

    shops$ = defer(() => this.partyId$).pipe(
        switchMap((partyId) =>
            partyId
                ? this.partyManagementService
                      .Get(partyId)
                      .pipe(map(({ shops }) => Array.from(shops.values())))
                : of<Shop[]>([]),
        ),
        share(),
    );

    private partyId$ = new BehaviorSubject<PartyID>(null);

    constructor(
        private partyManagementService: PartyManagementService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    setDisabledState(isDisabled: boolean) {
        super.setDisabledState(!this.partyId || isDisabled);
    }

    ngOnChanges(changes: ComponentChanges<ShopFieldComponent>): void {
        super.ngOnChanges(changes);
        if (changes.partyId && this.partyId !== this.partyId$.value) {
            this.partyId$.next(changes.partyId.currentValue);
            setDisabled(this.control, !this.partyId);
        }
    }

    ngOnInit() {
        this.shops$
            .pipe(
                filter(
                    (shops) =>
                        !isEmpty(this.control.value) &&
                        (Array.isArray(this.control.value)
                            ? !this.control.value.every((v) => shops.some((s) => s.id === v))
                            : !shops.some((s) => s.id === this.control.value)),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                this.control.setValue(null);
            });
        super.ngOnInit();
    }
}
