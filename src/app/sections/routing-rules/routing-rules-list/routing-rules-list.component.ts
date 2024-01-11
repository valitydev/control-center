import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    booleanAttribute,
    DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
    DialogResponseStatus,
    DialogService,
    ConfirmDialogComponent,
    Column,
    createOperationColumn,
    ComponentChanges,
    NotifyLogService,
} from '@vality/ng-core';
import { filter, switchMap } from 'rxjs/operators';

import { handleError } from '../../../../utils/operators/handle-error';
import { ChangeDelegateRulesetDialogComponent } from '../change-delegate-ruleset-dialog';
import { ChangeTargetDialogComponent } from '../change-target-dialog';
import { RoutingRulesService } from '../services/routing-rules';

type DelegateId = {
    parentRefId: number;
    delegateIdx: number;
};

@Component({
    selector: 'cc-routing-rules-list',
    templateUrl: 'routing-rules-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutingRulesListComponent<
    T extends { [N in PropertyKey]: unknown } & DelegateId = {
        [N in PropertyKey]: unknown;
    } & DelegateId,
> implements OnChanges
{
    @Input() data: T[];
    @Input() displayedColumns: { key: keyof T; name: string }[];
    @Input({ transform: booleanAttribute }) progress: boolean = false;

    @Output() toDetails = new EventEmitter<DelegateId>();

    columns: Column<T>[] = [];

    constructor(
        private dialogService: DialogService,
        private log: NotifyLogService,
        private routingRulesService: RoutingRulesService,
        private route: ActivatedRoute,
        private destroyRef: DestroyRef,
    ) {}

    ngOnChanges(changes: ComponentChanges<RoutingRulesListComponent<T>>) {
        if (changes.displayedColumns) {
            this.columns = [
                ...this.displayedColumns.map(
                    (c, idx): Column<T> => ({
                        field: `${c.key as string}.text`,
                        formatter:
                            idx === 0
                                ? (d) => {
                                      const v = d?.[c.key] as { caption: string; text: string };
                                      return v?.text || `#${v?.caption}`;
                                  }
                                : undefined,
                        click:
                            idx === 0
                                ? (d) =>
                                      this.toDetails.emit({
                                          parentRefId: d?.parentRefId,
                                          delegateIdx: d?.delegateIdx,
                                      })
                                : undefined,
                        header: c.name,
                        description: `${c.key as string}.caption`,
                    }),
                ),
                createOperationColumn([
                    {
                        label: 'Details',
                        click: (d) =>
                            this.toDetails.emit({
                                parentRefId: d?.parentRefId,
                                delegateIdx: d?.delegateIdx,
                            }),
                    },
                    {
                        label: 'Change delegate ruleset',
                        click: (d) => this.changeDelegateRuleset(d),
                    },
                    {
                        label: 'Change main ruleset',
                        click: (d) => this.changeTarget(d),
                    },
                    {
                        label: 'Clone delegate ruleset',
                        click: (d) => this.cloneDelegateRuleset(d),
                    },
                    {
                        label: 'Delete',
                        click: (d) => this.delete(d),
                    },
                ]),
            ];
        }
    }

    changeDelegateRuleset(delegateId: DelegateId) {
        this.dialogService
            .open(ChangeDelegateRulesetDialogComponent, {
                mainRulesetRefID: delegateId.parentRefId,
                delegateIdx: delegateId.delegateIdx,
            })
            .afterClosed()
            .pipe(handleError(this.log.error), takeUntilDestroyed(this.destroyRef))
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
