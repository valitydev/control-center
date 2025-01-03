import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { Reference } from '@vality/domain-proto/internal/domain';
import { ComponentChanges, DialogService } from '@vality/matez';
import { isEqualThrift } from '@vality/ng-thrift';
import { combineLatest, ReplaySubject, switchMap } from 'rxjs';
import { map, shareReplay, first } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../api/domain-config/stores/domain-store.service';
import { SidenavInfoModule } from '../../../sidenav-info';
import { CardComponent } from '../../../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';
import { EditDomainObjectDialogComponent } from '../edit-domain-object-dialog';
import { DeleteDomainObjectService } from '../services';
import { getDomainObjectDetails } from '../utils';

@Component({
    selector: 'cc-domain-object-card',
    standalone: true,
    imports: [
        CommonModule,
        DomainThriftViewerComponent,
        CardComponent,
        SidenavInfoModule,
        MatButtonModule,
    ],
    templateUrl: './domain-object-card.component.html',
})
export class DomainObjectCardComponent implements OnChanges {
    @Input() ref!: Reference;

    ref$ = new ReplaySubject<Reference>(1);
    progress$ = this.domainStoreService.isLoading$;
    domainObject$ = combineLatest([this.domainStoreService.domain$, this.ref$]).pipe(
        map(([domain, ref]) =>
            domain.get(Array.from(domain.keys()).find((k) => isEqualThrift(k, ref))),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    title$ = this.domainObject$.pipe(
        map((domainObject) => getDomainObjectDetails(domainObject)?.label),
    );

    constructor(
        private deleteDomainObjectService: DeleteDomainObjectService,
        private domainStoreService: DomainStoreService,
        private destroyRef: DestroyRef,
        private dialogService: DialogService,
    ) {}

    ngOnChanges(changes: ComponentChanges<DomainObjectCardComponent>) {
        if (changes.ref) {
            this.ref$.next(this.ref);
        }
    }

    edit() {
        this.domainObject$
            .pipe(
                first(),
                switchMap((domainObject) =>
                    this.dialogService
                        .open(EditDomainObjectDialogComponent, { domainObject })
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    delete() {
        this.deleteDomainObjectService.delete(this.ref);
    }
}
