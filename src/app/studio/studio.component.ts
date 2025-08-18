import { Observable, combineLatest, map, shareReplay, skipWhile } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

import {
    Option,
    SelectFieldModule,
    compareDifferentTypes,
    getValueChanges,
    switchCombineWith,
} from '@vality/matez';
import { ThriftEditorModule, ValueTypeTitlePipe } from '@vality/ng-thrift';
import { Method } from '@vality/thrift-ts';

import { MetadataThriftService, services } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';

@Component({
    selector: 'cc-studio',
    imports: [
        PageLayoutModule,
        SelectFieldModule,
        ThriftEditorModule,
        ReactiveFormsModule,
        CommonModule,
        ValueTypeTitlePipe,
    ],
    templateUrl: './studio.component.html',
})
export class StudioComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private dr = inject(DestroyRef);

    studioGroup = this.fb.group<{
        service: MetadataThriftService | null;
        method: Method | null;
        params: object | null;
    }>({
        service: null,
        method: null,
        params: null,
    });

    serviceOptions: Option<MetadataThriftService>[] = services
        .map((s) => ({
            label: s.service,
            value: s,
        }))
        .sort((a, b) => compareDifferentTypes(a.label, b.label));
    namespaceMetadata$ = getValueChanges(this.studioGroup.controls.service).pipe(
        skipWhile((service) => !service),
        switchCombineWith((service) => [service?.metadata$]),
        map(([service, metadata]) => metadata.find((m) => m.name === service.namespace)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    serviceMetadata$ = combineLatest([
        getValueChanges(this.studioGroup.controls.service),
        this.namespaceMetadata$,
    ]).pipe(
        map(([service, metadata]) => metadata.ast.service[service.service]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    methodOptions$: Observable<Option<Method>[]> = this.serviceMetadata$.pipe(
        map((metadata) =>
            Object.entries(metadata.functions)
                .map(([name, method]) => ({
                    label: name,
                    value: method,
                }))
                .sort((a, b) => compareDifferentTypes(a.label, b.label)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    ngOnInit() {
        this.studioGroup
            .get('service')
            .valueChanges.pipe(takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.studioGroup.get('method').reset();
                this.studioGroup.get('params').reset();
            });
        this.studioGroup
            .get('method')
            .valueChanges.pipe(takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.studioGroup.get('params').reset();
            });
    }
}
