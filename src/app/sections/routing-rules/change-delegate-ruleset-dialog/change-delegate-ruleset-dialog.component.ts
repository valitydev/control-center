import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { RoutingRulesService } from '../../../thrift-services';

@UntilDestroy()
@Component({
    selector: 'cc-change-delegate-ruleset-dialog',
    templateUrl: 'change-delegate-ruleset-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeDelegateRulesetDialogComponent
    extends BaseDialogSuperclass<
        ChangeDelegateRulesetDialogComponent,
        { mainRulesetRefID: number; delegateIdx: number }
    >
    implements OnInit
{
    form = this.fb.group({
        rulesetRefId: [],
        description: '',
    });

    rulesets$ = this.routingRulesService.rulesets$;

    constructor(
        injector: Injector,
        private fb: UntypedFormBuilder,
        private routingRulesService: RoutingRulesService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.routingRulesService
            .getRuleset(this.dialogData.mainRulesetRefID)
            .pipe(
                map((r) => r?.data?.decisions?.delegates?.[this.dialogData?.delegateIdx]),
                untilDestroyed(this)
            )
            .subscribe((delegate) => {
                this.form.patchValue({
                    rulesetRefId: delegate?.ruleset?.id,
                    description: delegate?.description,
                });
            });
    }

    changeRuleset() {
        this.routingRulesService
            .changeDelegateRuleset({
                mainRulesetRefID: this.dialogData.mainRulesetRefID,
                delegateIdx: this.dialogData.delegateIdx,
                newDelegateRulesetRefID: this.form.value.rulesetRefId,
                description: this.form.value.description,
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => this.dialogRef.close());
    }
}
