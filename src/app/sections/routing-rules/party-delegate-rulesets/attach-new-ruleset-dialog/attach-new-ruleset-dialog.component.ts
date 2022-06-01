import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { ErrorService } from '../../../../shared/services/error';
import { RoutingRulesService } from '../../../../thrift-services';
import { TargetRuleset } from '../../target-ruleset-form';

@UntilDestroy()
@Component({
    templateUrl: 'attach-new-ruleset-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachNewRulesetDialogComponent extends BaseDialogSuperclass<
    AttachNewRulesetDialogComponent,
    { partyID: string }
> {
    form = this.fb.group({
        ruleset: this.fb.group({
            name: 'submain ruleset[by shop id]',
            description: '',
        }),
    });

    targetRuleset$ = new BehaviorSubject<TargetRuleset>(undefined);
    targetRulesetValid$ = new BehaviorSubject<boolean>(undefined);

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private paymentRoutingRulesService: RoutingRulesService,
        private errorService: ErrorService
    ) {
        super(injector);
    }

    attach() {
        const { mainRulesetRefID, mainDelegateDescription } = this.targetRuleset$.value;
        this.paymentRoutingRulesService
            .attachPartyDelegateRuleset({
                partyID: this.dialogData.partyID,
                mainRulesetRefID,
                mainDelegateDescription,
                ruleset: this.form.value.ruleset,
            })
            .pipe(untilDestroyed(this))
            .subscribe({
                next: () => this.dialogRef.close(),
                error: (err) => this.errorService.error(err),
            });
    }
}
