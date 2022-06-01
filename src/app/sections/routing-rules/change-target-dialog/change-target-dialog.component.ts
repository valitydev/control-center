import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { ErrorService } from '../../../shared/services/error';
import { RoutingRulesService } from '../../../thrift-services';
import { TargetRuleset } from '../target-ruleset-form';

@UntilDestroy()
@Component({
    templateUrl: 'change-target-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeTargetDialogComponent extends BaseDialogSuperclass<
    ChangeTargetDialogComponent,
    { mainRulesetRefID: number; delegateIdx: number }
> {
    targetRuleset$ = new BehaviorSubject<TargetRuleset>(undefined);
    targetRulesetValid$ = new BehaviorSubject<boolean>(undefined);
    initValue: Partial<TargetRuleset> = {};

    constructor(
        injector: Injector,
        private routingRulesService: RoutingRulesService,
        private errorService: ErrorService
    ) {
        super(injector);
        this.routingRulesService
            .getRuleset(this.dialogData?.mainRulesetRefID)
            .pipe(untilDestroyed(this))
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
            .pipe(untilDestroyed(this))
            .subscribe(() => this.dialogRef.close(), this.errorService.error);
    }
}
