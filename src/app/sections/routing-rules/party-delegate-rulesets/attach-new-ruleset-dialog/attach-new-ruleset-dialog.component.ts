import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';

import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
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
    { partyID: string; type: RoutingRulesType }
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
        private fb: UntypedFormBuilder,
        private routingRulesService: RoutingRulesService,
        private errorService: ErrorService
    ) {
        super(injector);
    }

    attach() {
        const { mainRulesetRefID, mainDelegateDescription } = this.targetRuleset$.value;
        this.routingRulesService
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
