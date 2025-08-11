import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { PaymentInstitutionObject } from '@vality/domain-proto/domain';
import { ComponentChanges } from '@vality/matez';
import sortBy from 'lodash-es/sortBy';
import { map, startWith } from 'rxjs/operators';

import { PaymentInstitutionsStoreService } from '~/api/domain-config';

import { RoutingRulesService } from '../../services/routing-rules';
import { RoutingRulesType } from '../../types/routing-rules-type';
import { getPoliciesIdByType } from '../../utils/get-policies-id-by-type';

import { Target } from './types/target';
import { TargetRuleset } from './types/target-ruleset';


@Component({
    selector: 'cc-target-ruleset-form',
    templateUrl: 'target-ruleset-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TargetRulesetFormComponent implements OnChanges {
    private fb = inject(UntypedFormBuilder);
    private paymentInstitutionsStoreService = inject(PaymentInstitutionsStoreService);
    private routingRulesService = inject(RoutingRulesService);
    private destroyRef = inject(DestroyRef);
    @Output() valid = new EventEmitter<boolean>();
    @Output() valueChanges = new EventEmitter<TargetRuleset>();
    @Input() value: Partial<TargetRuleset>;
    @Input() type: RoutingRulesType;

    form = this.fb.group({
        target: Target.PaymentInstitution,
        paymentInstitution: '',
        mainRulesetRefID: '',
        mainDelegateDescription: 'Main delegate[party]',
    });

    target = Target;

    paymentInstitutions$ = this.paymentInstitutionsStoreService.paymentInstitutions$.pipe(
        map((r) => sortBy(r, ['ref.id'])),
    );
    rulesets$ = this.routingRulesService.rulesets$;

    get policiesId() {
        return getPoliciesIdByType(
            (this.form.value.paymentInstitution as PaymentInstitutionObject)?.data,
            this.type,
        );
    }

    constructor() {
        this.form.controls['target'].valueChanges
            .pipe(startWith(this.form.value.target), takeUntilDestroyed(this.destroyRef))
            .subscribe((target) => {
                switch (target) {
                    case Target.Manual:
                        this.form.controls['paymentInstitution'].disable();
                        this.form.controls['mainRulesetRefID'].enable();
                        break;
                    case Target.PaymentInstitution:
                        this.form.controls['paymentInstitution'].enable();
                        this.form.controls['mainRulesetRefID'].disable();
                        break;
                }
            });
        this.form.valueChanges
            .pipe(
                startWith(this.form.value),
                map(
                    ({
                        target,
                        mainRulesetRefID,
                        paymentInstitution,
                        mainDelegateDescription,
                    }) => ({
                        mainRulesetRefID:
                            target === Target.PaymentInstitution
                                ? getPoliciesIdByType(
                                      (paymentInstitution as PaymentInstitutionObject)?.data,
                                      this.type,
                                  )
                                : mainRulesetRefID,
                        paymentInstitutionRefID:
                            target === Target.PaymentInstitution
                                ? paymentInstitution?.ref?.id
                                : undefined,
                        mainDelegateDescription,
                    }),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => this.valueChanges.emit(value));
        this.form.statusChanges
            .pipe(
                startWith(this.form.valid),
                map(() => this.form.valid),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((valid) => this.valid.emit(valid));
    }

    ngOnChanges({ value }: ComponentChanges<TargetRulesetFormComponent>) {
        if (value) {
            const { mainRulesetRefID, mainDelegateDescription } = value.currentValue || {};
            this.form.patchValue(
                Object.assign(
                    {},
                    !!mainRulesetRefID && { mainRulesetRefID, target: Target.Manual },
                    !!mainDelegateDescription && { mainDelegateDescription },
                ),
            );
        }
    }

    getRulesetById(id: number) {
        return this.routingRulesService.getRuleset(id);
    }
}
