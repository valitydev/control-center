import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogSuperclass } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { RoutingRulesService } from '../services/routing-rules';
import { TargetRuleset } from '../target-ruleset-form';
import { RoutingRulesType } from '../types/routing-rules-type';

@UntilDestroy()
@Component({
    templateUrl: 'change-target-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeTargetDialogComponent extends DialogSuperclass<
    ChangeTargetDialogComponent,
    { mainRulesetRefID: number; delegateIdx: number; type: RoutingRulesType }
> {
    targetRuleset$ = new BehaviorSubject<TargetRuleset>(undefined);
    targetRulesetValid$ = new BehaviorSubject<boolean>(undefined);
    initValue: Partial<TargetRuleset> = {};

    constructor(
        injector: Injector,
        private routingRulesService: RoutingRulesService,
        private notificationErrorService: NotificationErrorService
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
            .subscribe(() => this.dialogRef.close(), this.notificationErrorService.error);
    }
}
