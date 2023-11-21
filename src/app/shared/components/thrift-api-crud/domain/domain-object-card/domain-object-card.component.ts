import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DomainObject } from '@vality/domain-proto/domain';
import { Reference } from '@vality/domain-proto/internal/domain';
import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
} from '@vality/ng-core';
import { filter, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../api/domain-config';
import { CardComponent } from '../../../sidenav-info/components/card/card.component';
import { CardActionsComponent } from '../../../sidenav-info/components/card-actions/card-actions.component';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';
import { getDomainObjectDetails } from '../utils';

@Component({
    selector: 'cc-domain-object-card',
    standalone: true,
    imports: [
        CommonModule,
        DomainThriftViewerComponent,
        CardComponent,
        CardActionsComponent,
        MatButtonModule,
    ],
    templateUrl: './domain-object-card.component.html',
})
export class DomainObjectCardComponent {
    @Input() domainObject: DomainObject;
    @Input() ref: Reference;
    @Input() progress: boolean;

    get title() {
        return getDomainObjectDetails(this.domainObject)?.label;
    }

    constructor(
        private router: Router,
        private dialogService: DialogService,
        private domainStoreService: DomainStoreService,
        private log: NotifyLogService,
    ) {}

    edit() {
        void this.router.navigate(['domain', 'edit'], {
            queryParams: { ref: JSON.stringify(this.ref) },
        });
    }

    delete() {
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Delete object' })
            .afterClosed()
            .pipe(
                untilDestroyed(this),
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.domainStoreService.commit({
                        ops: [{ remove: { object: this.domainObject } }],
                    }),
                ),
            )
            .subscribe({
                next: () => {
                    this.log.success('Successfully removed');
                },
                error: this.log.error,
            });
    }
}
