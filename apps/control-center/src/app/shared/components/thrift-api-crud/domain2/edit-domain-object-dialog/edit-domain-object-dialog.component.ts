import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    DEFAULT_DIALOG_CONFIG,
    DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    DialogConfig,
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    UnionEnum,
    createStorageValue,
    enumHasValue,
    getValueChanges,
    progressTo,
} from '@vality/matez';
import {
    EditorKind,
    ThriftPipesModule,
    getUnionKey,
    getUnionValue,
    isEqualThrift,
} from '@vality/ng-thrift';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { DomainService, MetadataService } from '../../../../../api/domain-config';
import { APP_ROUTES } from '../../../../../app-routes';
import { NavigateService } from '../../../../services';
import { DomainThriftFormComponent } from '../../domain/domain-thrift-form';
import { DomainThriftViewerComponent } from '../../domain/domain-thrift-viewer';

enum Step {
    Edit,
    Review,
    SourceReview,
}

@Component({
    selector: 'cc-edit-domain-object-dialog',
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
    { domainObject: VersionedObject }
> {
    private dr = inject(DestroyRef);
    private log = inject(NotifyLogService);
    private navigateService = inject(NavigateService);
    private metadataService = inject(MetadataService);
    private domainService = inject(DomainService);
    static override defaultDialogConfig: ValuesType<DialogConfig> = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

    control = new FormControl<ValuesType<DomainObject>['data']>(
        getUnionValue(this.dialogData.domainObject.object).data,
        [Validators.required],
    );
    step: Step = Step.Edit;
    stepEnum = Step;

    get srcObject(): DomainObject {
        return this.dialogData.domainObject.object;
    }
    get type() {
        return getUnionKey(this.dialogData.domainObject.object);
    }
    dataType$ = this.metadataService.getDomainObjectDataFieldByName(this.type).pipe(
        map((f) => String(f.type)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    currentObject = signal(this.dialogData.domainObject.object);
    newObject$ = getValueChanges(this.control).pipe(
        map(() => this.getNewObject()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    hasConflict = computed(() => {
        return !isEqualThrift(this.currentObject(), this.dialogData.domainObject.object);
    });
    hasChanges$ = combineLatest([toObservable(this.currentObject), this.newObject$]).pipe(
        map(([a, b]) => !isEqualThrift(a, b)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    kind = createStorageValue<UnionEnum<EditorKind>>('edit-domain-object-dialog-kind', {
        deserialize: (v) => (enumHasValue(EditorKind, v) ? v : EditorKind.Form),
    });
    isLoading = signal(0);

    update() {
        this.domainService
            .update([this.getNewObject()], this.dialogData.domainObject.info.version)
            .pipe(progressTo(this.isLoading), takeUntilDestroyed(this.dr))
            .subscribe({
                next: () => {
                    this.log.successOperation('update', 'domain object');
                    void this.navigateService.navigate(APP_ROUTES.domain2.root, {
                        type: this.type,
                    });
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.errorOperation(err, 'update', 'domain object');
                },
            });
    }

    private getNewObject(): DomainObject {
        return {
            [this.type]: {
                ref: getUnionValue(this.dialogData.domainObject.object).ref,
                data: this.control.value,
            },
        };
    }
}
