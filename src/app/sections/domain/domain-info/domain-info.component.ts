import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud';

@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
})
export class DomainInfoComponent {
    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;
    selectedTypes$ = new BehaviorSubject<string[]>([]);

    constructor(
        private domainStoreService: DomainStoreService,
        private dialogService: DialogService,
        private destroyRef: DestroyRef,
    ) {}

    create() {
        this.selectedTypes$
            .pipe(first(), takeUntilDestroyed(this.destroyRef))
            .subscribe((types) => {
                this.dialogService.open(
                    CreateDomainObjectDialogComponent,
                    types?.length === 1
                        ? {
                              objectType: types[0],
                          }
                        : undefined,
                );
            });
    }
}
