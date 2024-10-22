import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    booleanAttribute,
    DestroyRef,
    input,
    computed,
    runInInjectionContext,
    Injector,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
    DialogResponseStatus,
    DialogService,
    ConfirmDialogComponent,
    NotifyLogService,
    Column2,
    createMenuColumn,
} from '@vality/ng-core';
import { filter, switchMap, catchError } from 'rxjs/operators';

import { ChangeDelegateRulesetDialogComponent } from '../change-delegate-ruleset-dialog';
import { ChangeTargetDialogComponent } from '../change-target-dialog';
import { RoutingRulesService } from '../services/routing-rules';

type DelegateId = {
    parentRefId: number;
    delegateIdx: number;
};

export type RoutingRulesListItem<T> = DelegateId & { item: T };

@Component({
    selector: 'cc-routing-rules-list',
    templateUrl: 'routing-rules-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutingRulesListComponent<T> {
    @Input() data: T[];
    displayedColumns = input<Column2<RoutingRulesListItem<T>>[]>([]);
    @Input({ transform: booleanAttribute }) progress: boolean = false;
    @Output() toDetails = new EventEmitter<DelegateId>();

    columns = computed<Column2<RoutingRulesListItem<T>>[]>(() =>
        runInInjectionContext(this.injector, () => [
            ...this.displayedColumns(),
            createMenuColumn((d) => ({
                items: [
                    {
                        label: 'Details',
                        click: () =>
                            this.toDetails.emit({
                                parentRefId: d?.parentRefId,
                                delegateIdx: d?.delegateIdx,
                            }),
                    },
                    {
                        label: 'Change delegate ruleset',
                        click: () => this.changeDelegateRuleset(d),
                    },
                    {
                        label: 'Change main ruleset',
                        click: () => this.changeTarget(d),
                    },
                    {
                        label: 'Clone delegate ruleset',
                        click: () => this.cloneDelegateRuleset(d),
                    },
                    {
                        label: 'Delete',
                        click: () => this.delete(d),
                    },
                ],
            })),
        ]),
    );

    constructor(
        private dialogService: DialogService,
        private log: NotifyLogService,
        private routingRulesService: RoutingRulesService,
        private route: ActivatedRoute,
        private destroyRef: DestroyRef,
        private injector: Injector,
    ) {}

    changeDelegateRuleset(delegateId: DelegateId) {
        this.dialogService
            .open(ChangeDelegateRulesetDialogComponent, {
                mainRulesetRefID: delegateId.parentRefId,
                delegateIdx: delegateId.delegateIdx,
            })
            .afterClosed()
            .pipe(
                catchError((err) => {
                    this.log.error(err);
                    throw err;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    changeTarget(delegateId: DelegateId) {
        this.dialogService
            .open(ChangeTargetDialogComponent, {
                mainRulesetRefID: delegateId.parentRefId,
                delegateIdx: delegateId.delegateIdx,
                type: this.route.snapshot.params.type,
            })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ error: this.log.error });
    }

    cloneDelegateRuleset(delegateId: DelegateId) {
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Clone delegate ruleset' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.routingRulesService.cloneDelegateRuleset({
                        mainRulesetRefID: delegateId.parentRefId,
                        delegateIdx: delegateId.delegateIdx,
                    }),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({ error: this.log.error });
    }

    delete(delegateId: DelegateId) {
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Delete delegate' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.routingRulesService.deleteDelegate({
                        mainRulesetRefID: delegateId.parentRefId,
                        delegateIdx: delegateId.delegateIdx,
                    }),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({ error: this.log.error });
    }
}
