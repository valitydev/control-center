import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '@vality/matez';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config/stores/domain-store.service';
import { CreateDomainObjectDialogComponent } from '../../../shared/components/thrift-api-crud';

@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
    standalone: false,
})
export class DomainInfoComponent {
    private domainStoreService = inject(DomainStoreService);
    private dialogService = inject(DialogService);
    private destroyRef = inject(DestroyRef);
    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;
    selectedTypes$ = new BehaviorSubject<string[]>([]);

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
