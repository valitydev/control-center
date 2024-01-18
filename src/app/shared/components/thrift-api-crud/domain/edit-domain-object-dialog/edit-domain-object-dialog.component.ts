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
} from '@vality/ng-core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { getUnionKey, getUnionValue } from '../../../../../../utils';
import { DomainStoreService } from '../../../../../api/domain-config';
import { DomainNavigateService } from '../../../../../sections/domain/services/domain-navigate.service';
import { MetadataService } from '../../../../../sections/domain/services/metadata.service';
import { DomainThriftFormComponent } from '../domain-thrift-form';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';

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
    isReview = false;

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

    constructor(
        private domainStoreService: DomainStoreService,
        private destroyRef: DestroyRef,
        private log: NotifyLogService,
        private domainNavigateService: DomainNavigateService,
        private metadataService: MetadataService,
    ) {
        super();
    }

    update() {
        this.domainStoreService
            .commit({
                ops: [
                    {
                        update: {
                            old_object: this.dialogData.domainObject,
                            new_object: {
                                [getUnionKey(this.dialogData.domainObject)]: {
                                    ref: getUnionValue(this.dialogData.domainObject),
                                    data: this.control.value,
                                },
                            },
                        },
                    },
                ],
            })
            .pipe(
                switchMap(() => this.type$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (type) => {
                    this.log.successOperation('update', 'domain object');
                    void this.domainNavigateService.toType(type);
                    this.closeWithSuccess();
                },
                error: this.log.error,
            });
    }
}
