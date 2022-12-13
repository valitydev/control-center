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
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { combineLatest, defer, ReplaySubject } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { ConfirmActionDialogComponent } from '../../../../components/confirm-action-dialog';
import { handleError } from '../../../../utils/operators/handle-error';
import { NotificationErrorService } from '../../../shared/services/error';
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
export class RoutingRulesListComponent<T extends { [N in PropertyKey]: any } & DelegateId = any> {
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
        private baseDialogService: BaseDialogService,
        private errorService: NotificationErrorService,
        private routingRulesService: RoutingRulesService,
        private route: ActivatedRoute
    ) {}

    changeDelegateRuleset(delegateId: DelegateId) {
        this.baseDialogService
            .open(ChangeDelegateRulesetDialogComponent, {
                mainRulesetRefID: delegateId.parentRefId,
                delegateIdx: delegateId.delegateIdx,
            })
            .afterClosed()
            .pipe(handleError(this.errorService.error), untilDestroyed(this))
            .subscribe();
    }

    changeTarget(delegateId: DelegateId) {
        this.baseDialogService
            .open(ChangeTargetDialogComponent, {
                mainRulesetRefID: delegateId.parentRefId,
                delegateIdx: delegateId.delegateIdx,
                type: this.route.snapshot.params.type,
            })
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe({ error: this.errorService.error });
    }

    cloneDelegateRuleset(delegateId: DelegateId) {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Clone delegate ruleset' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() =>
                    this.routingRulesService.cloneDelegateRuleset({
                        mainRulesetRefID: delegateId.parentRefId,
                        delegateIdx: delegateId.delegateIdx,
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe({ error: this.errorService.error });
    }

    delete(delegateId: DelegateId) {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Delete delegate' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() =>
                    this.routingRulesService.deleteDelegate({
                        mainRulesetRefID: delegateId.parentRefId,
                        delegateIdx: delegateId.delegateIdx,
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe({ error: this.errorService.error });
    }
}
