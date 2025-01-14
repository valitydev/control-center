import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';
import { BehaviorSubject } from 'rxjs';

import { RoutingRulesService } from '../services/routing-rules';
import { TargetRuleset } from '../target-ruleset-form';
import { RoutingRulesType } from '../types/routing-rules-type';

@Component({
    templateUrl: 'change-target-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ChangeTargetDialogComponent extends DialogSuperclass<
    ChangeTargetDialogComponent,
    { mainRulesetRefID: number; delegateIdx: number; type: RoutingRulesType }
> {
    targetRuleset$ = new BehaviorSubject<TargetRuleset>(undefined);
    targetRulesetValid$ = new BehaviorSubject<boolean>(undefined);
    initValue: Partial<TargetRuleset> = {};

    constructor(
        private routingRulesService: RoutingRulesService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
        this.routingRulesService
            .getRuleset(this.dialogData?.mainRulesetRefID)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((ruleset) => {
                this.initValue = {
                    mainRulesetRefID: ruleset.ref.id,
                    mainDelegateDescription:
                        ruleset?.data?.decisions?.delegates?.[this.dialogData?.delegateIdx]
                            ?.description,
                };
            });
    }

    changeTarget() {
        const { mainRulesetRefID, mainDelegateDescription } = this.targetRuleset$.value;
        const { mainRulesetRefID: previousMainRulesetRefID, delegateIdx } = this.dialogData;
        this.routingRulesService
            .changeMainRuleset({
                previousMainRulesetRefID,
                mainRulesetRefID,
                mainDelegateDescription,
                delegateIdx,
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.dialogRef.close(), this.log.error);
    }
}
