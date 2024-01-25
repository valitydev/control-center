import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject } from '@vality/domain-proto/domain';
import {
    DialogSuperclass,
    DEFAULT_DIALOG_CONFIG,
    DialogModule,
    DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    DialogConfig,
    NotifyLogService,
    getValueChanges,
    progressTo,
} from '@vality/ng-core';
import { BehaviorSubject, switchMap, EMPTY, combineLatest, defer } from 'rxjs';
import { first, map, shareReplay, catchError, distinctUntilChanged } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { getUnionKey, getUnionValue, isEqualThrift } from '../../../../../../utils';
import { DomainStoreService } from '../../../../../api/domain-config';
import { DomainNavigateService } from '../../../../../sections/domain/services/domain-navigate.service';
import { MetadataService } from '../../../../../sections/domain/services/metadata.service';
import { ThriftPipesModule } from '../../../../pipes';
import { DomainThriftFormComponent } from '../domain-thrift-form';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';

enum Step {
    Edit,
    Review,
    SourceReview,
}

@Component({
    selector: 'cc-edit-domain-object-dialog',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        DomainThriftViewerComponent,
        ThriftPipesModule,
    ],
    templateUrl: './edit-domain-object-dialog.component.html',
})
export class EditDomainObjectDialogComponent extends DialogSuperclass<
    EditDomainObjectDialogComponent,
    { domainObject: DomainObject }
> {
    static defaultDialogConfig: ValuesType<DialogConfig> = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

    control = new FormControl<ValuesType<DomainObject>['data']>(
        getUnionValue(this.dialogData.domainObject).data,
        [Validators.required],
    );
    step: Step = Step.Edit;
    stepEnum = Step;
    type$ = this.metadataService
        .getDomainFieldByName(getUnionKey(this.dialogData.domainObject))
        .pipe(
            map((f) => String(f.type)),
            first(),
        );
    dataType$ = this.metadataService
        .getDomainObjectDataFieldByName(getUnionKey(this.dialogData.domainObject))
        .pipe(
            map((f) => String(f.type)),
            first(),
        );
    currentObject$ = this.domainStoreService
        .getObject({
            [getUnionKey(this.dialogData.domainObject)]: getUnionValue(this.dialogData.domainObject)
                .ref,
        })
        .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    newObject$ = getValueChanges(this.control).pipe(
        map(() => this.getNewObject()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    hasConflict$ = this.currentObject$.pipe(
        map((currentObject) => !isEqualThrift(currentObject, this.dialogData.domainObject)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    hasChanges$ = combineLatest([this.currentObject$, this.newObject$]).pipe(
        map(([a, b]) => !isEqualThrift(a, b)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isLoading$ = combineLatest([
        this.domainStoreService.isLoading$,
        defer(() => this.progress$),
    ]).pipe(
        map((progresses) => progresses.some((p) => !!p)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private progress$ = new BehaviorSubject(0);

    constructor(
        private domainStoreService: DomainStoreService,
        private destroyRef: DestroyRef,
        private log: NotifyLogService,
        private domainNavigateService: DomainNavigateService,
        private metadataService: MetadataService,
    ) {
        super();
    }

    update(attempts = 1) {
        this.currentObject$
            .pipe(
                first(),
                switchMap((currentObject) =>
                    this.domainStoreService.commit({
                        ops: [
                            {
                                update: {
                                    old_object: currentObject,
                                    new_object: this.getNewObject(),
                                },
                            },
                        ],
                    }),
                ),
                catchError((err) => {
                    if (err?.name === 'ObsoleteCommitVersion') {
                        if (attempts > 0) {
                            this.domainStoreService.forceReload();
                            this.update(attempts - 1);
                            this.log.error(
                                err,
                                `Domain config is out of date, one more attempt...`,
                            );
                            return EMPTY;
                        }
                    } else if (err?.name === 'OperationConflict') {
                        this.domainStoreService.forceReload();
                        this.log.error(
                            err,
                            'The original object has been modified. View changes in the original object before committing your own.',
                        );
                        this.step = Step.Edit;
                        return EMPTY;
                    }
                    throw err;
                }),
                switchMap(() => this.type$),
                progressTo(this.progress$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (type) => {
                    this.log.successOperation('update', 'domain object');
                    void this.domainNavigateService.toType(type);
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.errorOperation(err, 'update', 'domain object');
                },
            });
    }

    private getNewObject(): DomainObject {
        return {
            [getUnionKey(this.dialogData.domainObject)]: {
                ref: getUnionValue(this.dialogData.domainObject).ref,
                data: this.control.value,
            },
        };
    }
}
