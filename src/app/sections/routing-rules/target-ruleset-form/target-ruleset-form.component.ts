import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PaymentInstitutionObject } from '@vality/domain-proto/domain';
import sortBy from 'lodash-es/sortBy';
import { map, startWith } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { ComponentChanges } from '@cc/app/shared/utils';

import { RoutingRulesService } from '../services/routing-rules';
import { RoutingRulesType } from '../types/routing-rules-type';
import { getPoliciesIdByType } from '../utils/get-policies-id-by-type';
import { Target } from './types/target';
import { TargetRuleset } from './types/target-ruleset';

@UntilDestroy()
@Component({
    selector: 'cc-target-ruleset-form',
    templateUrl: 'target-ruleset-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TargetRulesetFormComponent implements OnChanges {
    @Output() valid = new EventEmitter<boolean>();
    @Output() valueChanges = new EventEmitter<TargetRuleset>();
    @Input() value: TargetRuleset;
    @Input() type: RoutingRulesType;

    form = this.fb.group({
        target: Target.PaymentInstitution,
        paymentInstitution: '',
        mainRulesetRefID: '',
        mainDelegateDescription: 'Main delegate[party]',
    });

    target = Target;

    paymentInstitutions$ = this.domainStoreService
        .getObjects('payment_institution')
        .pipe(map((r) => sortBy(r, ['ref.id'])));
    rulesets$ = this.routingRulesService.rulesets$;

    get policiesId() {
        return getPoliciesIdByType(
            (this.form.value.paymentInstitution as PaymentInstitutionObject)?.data,
            this.type
        );
    }

    constructor(
        private fb: UntypedFormBuilder,
        private domainStoreService: DomainStoreService,
        private routingRulesService: RoutingRulesService
    ) {
        this.form.controls.target.valueChanges
            .pipe(startWith(this.form.value.target), untilDestroyed(this))
            .subscribe((target) => {
                switch (target) {
                    case Target.Manual:
                        this.form.controls.paymentInstitution.disable();
                        this.form.controls.mainRulesetRefID.enable();
                        break;
                    case Target.PaymentInstitution:
                        this.form.controls.paymentInstitution.enable();
                        this.form.controls.mainRulesetRefID.disable();
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
                                      this.type
                                  )
                                : mainRulesetRefID,
                        paymentInstitutionRefID:
                            target === Target.PaymentInstitution
                                ? paymentInstitution?.ref?.id
                                : undefined,
                        mainDelegateDescription,
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe((value) => this.valueChanges.emit(value));
        this.form.statusChanges
            .pipe(
                startWith(this.form.valid),
                map(() => this.form.valid),
                untilDestroyed(this)
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
                    !!mainDelegateDescription && { mainDelegateDescription }
                )
            );
        }
    }

    getRulesetById(id: number) {
        return this.routingRulesService.getRuleset(id);
    }
}
