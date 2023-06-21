import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogResponseStatus, DialogService, ConfirmDialogComponent } from '@vality/ng-core';
import { combineLatest, defer, ReplaySubject } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { handleError } from '../../../../utils/operators/handle-error';
import { ChangeDelegateRulesetDialogComponent } from '../change-delegate-ruleset-dialog';
import { ChangeTargetDialogComponent } from '../change-target-dialog';
import { RoutingRulesService } from '../services/routing-rules';

type DelegateId = {
    parentRefId: number;
    delegateIdx: number;
};

@UntilDestroy()
@Component({
    selector: 'cc-routing-rules-list',
    templateUrl: 'routing-rules-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutingRulesListComponent<
    T extends { [N in PropertyKey]: unknown } & DelegateId = {
        [N in PropertyKey]: unknown;
    } & DelegateId
> {
    @Input() displayedColumns: { key: keyof T; name: string }[];

    @Input() set data(data: T[]) {
        this.data$.next(data);
    }

    @Output() toDetails = new EventEmitter<DelegateId>();

    @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
        this.paginator$.next(paginator);
    }

    dataSource$ = combineLatest([
        defer(() => this.data$),
        defer(() => this.paginator$).pipe(startWith(null)),
    ]).pipe(
        map(([d, paginator]) => {
            const data = new MatTableDataSource(d);
            data.paginator = paginator;
            return data;
        }),
        shareReplay(1)
    );

    get allDisplayedColumns() {
        if (!this.displayedColumns) {
            return [];
        }
        return this.displayedColumns
            .concat([
                {
                    key: 'actions',
                    name: 'Actions',
                },
            ])
            .map(({ key }) => key);
    }

    private data$ = new ReplaySubject<T[]>(1);
    private paginator$ = new ReplaySubject<MatPaginator>(1);

    constructor(
        private dialogService: DialogService,
        private notificationErrorService: NotificationErrorService,
        private routingRulesService: RoutingRulesService,
        private route: ActivatedRoute
    ) {}

    changeDelegateRuleset(delegateId: DelegateId) {
        this.dialogService
            .open(ChangeDelegateRulesetDialogComponent, {
                mainRulesetRefID: delegateId.parentRefId,
                delegateIdx: delegateId.delegateIdx,
            })
            .afterClosed()
            .pipe(handleError(this.notificationErrorService.error), untilDestroyed(this))
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
            .pipe(untilDestroyed(this))
            .subscribe({ error: this.notificationErrorService.error });
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
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe({ error: this.notificationErrorService.error });
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
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe({ error: this.notificationErrorService.error });
    }
}
