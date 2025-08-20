import {
    BehaviorSubject,
    Observable,
    Subject,
    catchError,
    map,
    of,
    shareReplay,
    skipWhile,
    switchMap,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
    Option,
    SelectFieldModule,
    compareDifferentTypes,
    getValueChanges,
    progressTo,
    setDisabled,
    switchCombineWith,
} from '@vality/matez';
import {
    ThriftEditorModule,
    ThriftPipesModule,
    ThriftViewerModule,
    getValueTypeTitle,
} from '@vality/ng-thrift';
import { Method } from '@vality/thrift-ts';

import { MetadataThriftService, injectableServices, services } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { parseThriftError } from '~/utils';

import { inProgressFrom } from '../../../projects/matez/src/lib/utils/operators/in-progress-from';

@Component({
    selector: 'cc-studio',
    imports: [
        PageLayoutModule,
        SelectFieldModule,
        ThriftEditorModule,
        ReactiveFormsModule,
        CommonModule,
        MatButtonModule,
        ThriftViewerModule,
        MatProgressBarModule,
        MatDividerModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        ThriftPipesModule,
    ],
    templateUrl: './studio.component.html',
})
export class StudioComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private dr = inject(DestroyRef);
    private injector = inject(Injector);

    progress$ = new BehaviorSubject(0);
    inProgress$ = inProgressFrom(this.progress$);
    submit$ = new Subject<{
        method: (...args: unknown[]) => Observable<unknown>;
        args: unknown[];
    } | null>();
    result$ = this.submit$.pipe(
        switchMap((submit) =>
            submit
                ? submit.method(...submit.args).pipe(
                      map((data) => ({ data, error: null })),
                      catchError((error: unknown) => of({ error })),
                      progressTo(this.progress$),
                  )
                : of(null),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    error$ = this.result$.pipe(
        map((result) => parseThriftError(result?.error)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    studioGroup = this.fb.group<{
        service: MetadataThriftService | null;
        method: Method | null;
        params: FormArray;
    }>({
        service: null,
        method: null,
        params: this.fb.array([]),
    });

    serviceOptions: Option<MetadataThriftService>[] = services
        .map((s) => ({
            label: getValueTypeTitle(s.public),
            value: s,
        }))
        .sort((a, b) => compareDifferentTypes(a.label, b.label));
    namespaceMetadata$ = getValueChanges(this.studioGroup.controls.service).pipe(
        skipWhile((service) => !service),
        switchCombineWith((service) => [service?.metadata$]),
        map(([service, metadata]) => metadata.find((m) => m.name === service.namespace)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    serviceMetadata$ = this.namespaceMetadata$.pipe(
        skipWhile((metadata) => !metadata),
        map((metadata) => metadata.ast.service[this.studioGroup.value.service.service]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    methodOptions$: Observable<Option<Method>[]> = this.serviceMetadata$.pipe(
        skipWhile((metadata) => !metadata),
        map((metadata) =>
            Object.entries(metadata.functions)
                .map(([name, method]) => ({
                    label: getValueTypeTitle(name),
                    value: method,
                }))
                .sort((a, b) => compareDifferentTypes(a.label, b.label)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    ngOnInit() {
        this.studioGroup.get('method').disable();
        this.studioGroup
            .get('service')
            .valueChanges.pipe(takeUntilDestroyed(this.dr))
            .subscribe((service) => {
                this.studioGroup.get('method').reset();
                this.submit$.next(null);
                setDisabled(this.studioGroup.get('method'), !service);
            });
        this.studioGroup
            .get('method')
            .valueChanges.pipe(takeUntilDestroyed(this.dr))
            .subscribe((method) => {
                this.studioGroup.setControl(
                    'params',
                    this.fb.array(method?.args?.map(() => this.fb.control(null)) || []),
                );
                this.submit$.next(null);
            });
    }

    submit() {
        const service = this.injector.get(injectableServices[this.studioGroup.value.service.name]);
        this.submit$.next({
            method: service[this.studioGroup.value.method.name],
            args: this.studioGroup.value.params,
        });
    }
}
