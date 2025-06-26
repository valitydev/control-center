import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { DialogSuperclass } from '@vality/matez';
import { map } from 'rxjs/operators';

import { RoutingRulesService } from '../services/routing-rules';

@Component({
    selector: 'cc-change-delegate-ruleset-dialog',
    templateUrl: 'change-delegate-ruleset-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class ChangeDelegateRulesetDialogComponent
    extends DialogSuperclass<
        ChangeDelegateRulesetDialogComponent,
        { mainRulesetRefID: number; delegateIdx: number }
    >
    implements OnInit
{
    private fb = inject(UntypedFormBuilder);
    private routingRulesService = inject(RoutingRulesService);
    private destroyRef = inject(DestroyRef);
    form = this.fb.group({
        rulesetRefId: [],
        description: '',
    });

    rulesets$ = this.routingRulesService.rulesets$;

    ngOnInit() {
        this.routingRulesService
            .getRuleset(this.dialogData.mainRulesetRefID)
            .pipe(
                map((r) => r?.data?.decisions?.delegates?.[this.dialogData?.delegateIdx]),
                takeUntilDestroyed(this.destroyRef),
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.dialogRef.close());
    }
}
