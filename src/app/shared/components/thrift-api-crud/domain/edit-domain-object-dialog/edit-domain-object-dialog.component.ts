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
    DialogService,
    ConfirmDialogComponent,
} from '@vality/ng-core';
import { BehaviorSubject, switchMap, EMPTY } from 'rxjs';
import { first, map, shareReplay, catchError } from 'rxjs/operators';
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
    progress$ = new BehaviorSubject(0);
    step: Step = Step.Edit;
    stepEnum = Step;
    currentObject?: DomainObject;

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

    newObject$ = getValueChanges(this.control).pipe(
        map(() => this.getNewObject()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    get allowReview() {
        return (
            this.control.valid &&
            !isEqualThrift(this.currentObject ?? this.dialogData.domainObject, this.getNewObject())
        );
    }

    constructor(
        private domainStoreService: DomainStoreService,
        private destroyRef: DestroyRef,
        private log: NotifyLogService,
        private domainNavigateService: DomainNavigateService,
        private metadataService: MetadataService,
        private dialogService: DialogService,
    ) {
        super();
    }

    update(attempts = 1) {
        this.domainStoreService
            .getObject({
                [getUnionKey(this.dialogData.domainObject)]: getUnionValue(
                    this.dialogData.domainObject,
                ).ref,
            })
            .pipe(
                first(),
                switchMap((currentObject) => {
                    if (!isEqualThrift(currentObject, this.dialogData.domainObject)) {
                        this.dialogService.open(ConfirmDialogComponent, {
                            title: 'The object has been modified',
                            description:
                                'The original object has been modified. View changes in the original object before committing your own.',
                            confirmLabel: 'View',
                        });
                        this.step = Step.SourceReview;
                        this.currentObject = currentObject;
                        return EMPTY;
                    } else if (this.currentObject) {
                        this.currentObject = undefined;
                    }
                    return this.domainStoreService.commit({
                        ops: [
                            {
                                update: {
                                    old_object: currentObject,
                                    new_object: this.getNewObject(),
                                },
                            },
                        ],
                    });
                }),
                catchError((err) => {
                    if (err?.name === 'ObsoleteCommitVersion' && attempts !== 0) {
                        this.domainStoreService.forceReload();
                        this.update(attempts - 1);
                        this.log.error(err, `Domain config is out of date, one more attempt...`);
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

    private getNewObject() {
        return {
            [getUnionKey(this.dialogData.domainObject)]: {
                ref: getUnionValue(this.dialogData.domainObject).ref,
                data: this.control.value,
            },
        };
    }
}
