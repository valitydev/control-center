import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';
import { BehaviorSubject } from 'rxjs';

import { RoutingRulesService } from '../../services/routing-rules';
import { TargetRuleset } from '../../target-ruleset-form';
import { RoutingRulesType } from '../../types/routing-rules-type';

@Component({
    templateUrl: 'attach-new-ruleset-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class AttachNewRulesetDialogComponent extends DialogSuperclass<
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
        private fb: UntypedFormBuilder,
        private routingRulesService: RoutingRulesService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => this.dialogRef.close(),
                error: (err) => this.log.error(err),
            });
    }
}
