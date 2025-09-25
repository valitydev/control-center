import { startCase } from 'lodash-es';
import { combineLatest, debounceTime, distinctUntilChanged, map, merge } from 'rxjs';

import {
    Component,
    DestroyRef,
    Injector,
    OnInit,
    computed,
    inject,
    model,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { DomainObjectType, ReflessDomainObject } from '@vality/domain-proto/domain';
import {
    AutocompleteFieldModule,
    DialogResponseStatus,
    QueryParamsService,
    SelectFieldModule,
    TableModule,
    getEnumKeys,
    getValueChanges,
} from '@vality/matez';

import { DomainService, FetchDomainObjectsService } from '~/api/domain-config';
import { PageLayoutModule } from '~/components/page-layout';
import { DomainObjectService } from '~/components/thrift-api-crud/domain';

import { DomainObjectsTableComponent } from './domain-objects-table';

@Component({
    templateUrl: './domain-config.component.html',
    styleUrls: ['./domain-config.component.scss'],
    imports: [
        PageLayoutModule,
        DomainObjectsTableComponent,
        MatButtonModule,
        TableModule,
        SelectFieldModule,
        ReactiveFormsModule,
        AutocompleteFieldModule,
    ],
    providers: [FetchDomainObjectsService],
})
export class DomainConfigComponent implements OnInit {
    private domainService = inject(DomainService);
    private domainObjectService = inject(DomainObjectService);
    private dr = inject(DestroyRef);
    private injector = inject(Injector);
    protected fetchDomainObjectsService = inject(FetchDomainObjectsService);
    private qp = inject<
        QueryParamsService<{
            type?: keyof ReflessDomainObject;
            filter?: string;
            version?: number;
        }>
    >(QueryParamsService);

    selectedType = signal<keyof ReflessDomainObject>(null);
    version = this.domainService.version.value;
    typeControl = new FormControl(this.qp.params.type);
    versionControl = new FormControl(this.qp.params.version ?? -1, { nonNullable: true });
    filter = model<string>(this.qp.params.filter);

    create() {
        this.domainObjectService.create(this.selectedType()).next((result) => {
            if (result.status === DialogResponseStatus.Success) {
                this.fetchDomainObjectsService.reload();
            }
        });
    }

    typeOptions = getEnumKeys(DomainObjectType)
        .sort()
        .map((type) => ({
            label: startCase(String(type)),
            value: type,
        }));
    versionOptions = computed(() => {
        return Array.from({ length: this.version() - 1 }, (_, i) => ({
            label: `#${i + 1}`,
            value: i + 1,
        })).concat([{ label: `#${this.version() || 0} (latest)`, value: -1 }]);
    });

    ngOnInit() {
        merge(this.typeControl.valueChanges, this.qp.params$.pipe(map((params) => params.type)))
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.dr))
            .subscribe((type) => {
                this.selectedType.set(type);
                this.typeControl.setValue(type, { emitEvent: false });
                void this.qp.patch({ type });
            });
        merge(
            getValueChanges(this.versionControl),
            this.qp.params$.pipe(map((params) => params.version)),
        )
            .pipe(
                map((version) => version ?? -1),
                distinctUntilChanged(),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((version) => {
                this.versionControl.setValue(version, { emitEvent: false });
                void this.qp.patch({ version });
            });
        toObservable(this.filter, { injector: this.injector })
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((filter) => {
                void this.qp.patch({ filter });
            });
        combineLatest([
            getValueChanges(this.typeControl),
            getValueChanges(this.versionControl),
            toObservable(this.filter, { injector: this.injector }).pipe(debounceTime(300)),
        ])
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(([type, version, query]) => {
                if (type) {
                    this.fetchDomainObjectsService.setParams({
                        type: DomainObjectType[type],
                        version,
                        query,
                    });
                } else {
                    this.fetchDomainObjectsService.setParams({ version, query });
                }
            });
    }
}
