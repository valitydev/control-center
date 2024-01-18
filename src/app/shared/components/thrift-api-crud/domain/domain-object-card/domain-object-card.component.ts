import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { Reference } from '@vality/domain-proto/internal/domain';
import { ComponentChanges, DialogService } from '@vality/ng-core';
import { combineLatest, ReplaySubject, switchMap } from 'rxjs';
import { map, shareReplay, first } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { toJson } from '@cc/utils';

import { SidenavInfoModule } from '../../../sidenav-info';
import { CardComponent } from '../../../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';
import { EditDomainObjectDialogComponent } from '../edit-domain-object-dialog';
import { DomainObjectService } from '../services';
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
    domainObject$ = combineLatest([this.domainStoreService.getDomain(), this.ref$]).pipe(
        map(([domain, ref]) => {
            const searchRef = JSON.stringify(ref);
            return domain.get(
                Array.from(domain.keys()).find((k) => JSON.stringify(toJson(k)) === searchRef),
            );
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    title$ = this.domainObject$.pipe(
        map((domainObject) => getDomainObjectDetails(domainObject)?.label),
    );

    constructor(
        private domainObjectService: DomainObjectService,
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
        this.domainObject$
            .pipe(first(), takeUntilDestroyed(this.destroyRef))
            .subscribe((domainObject) => {
                this.domainObjectService.delete(domainObject);
            });
    }
}
