import { startCase } from 'lodash-es';
import { BehaviorSubject, combineLatest, first, map, shareReplay, switchMap } from 'rxjs';
import { ValuesType } from 'utility-types';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { ThriftAstMetadata, metadata$ } from '@vality/domain-proto';
import {
    DomainObject,
    DomainObjectType,
    Reference,
    ReflessDomainObject,
} from '@vality/domain-proto/domain';
import { InsertOp } from '@vality/domain-proto/domain_config_v2';
import {
    DEFAULT_DIALOG_CONFIG,
    DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    DialogConfig,
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    SelectFieldModule,
    getEnumKeys,
    progressTo,
} from '@vality/matez';
import { ThriftData, getUnionKey } from '@vality/ng-thrift';
import { Field } from '@vality/thrift-ts';

import { DomainService } from '~/api/domain-config';
import { NavigateService } from '~/services';

import { getValueChanges } from '../../../../../projects/matez/src/lib/utils/form/get-value-changes';
import { APP_ROUTES } from '../../../../app/app-routes';
import { DomainThriftFormComponent } from '../../domain/domain-thrift-editor';
import { DomainThriftViewerComponent } from '../../domain/domain-thrift-viewer';

// https://github.com/valitydev/dominant-v2/blob/d2687faf09d91f517030860c73fb0c844b3deac0/migrations/1722105006-create_initial_tables.sql#L58-L70
const FORCE_REF_OBJECTS: (keyof DomainObject)[] = [
    'currency',
    'payment_method',
    'globals',
    'payment_service',
    'payment_system',
    'payment_token',
    'mobile_operator',
    'crypto_currency',
    'country',
    'trade_bloc',
    'limit_config',
];

@Component({
    selector: 'cc-create-domain-object-dialog',
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        DomainThriftViewerComponent,
        MatDividerModule,
        SelectFieldModule,
    ],
    templateUrl: './create-domain-object-dialog.component.html',
})
export class CreateDomainObjectDialogComponent
    extends DialogSuperclass<
        CreateDomainObjectDialogComponent,
        { objectType?: keyof ReflessDomainObject } | void
    >
    implements OnInit
{
    private domainService = inject(DomainService);
    private destroyRef = inject(DestroyRef);
    private log = inject(NotifyLogService);
    private navigateService = inject(NavigateService);
    static override defaultDialogConfig: ValuesType<DialogConfig> = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

    typeControl = new FormControl<keyof Reference | null>(null);
    control = new FormControl<unknown>(null, [Validators.required]);

    options = getEnumKeys(DomainObjectType)
        .sort()
        .map((type) => ({
            label: startCase(String(type)),
            value: type,
        }));
    isForceRefObject$ = getValueChanges(this.typeControl).pipe(
        map((type) => type && FORCE_REF_OBJECTS.includes(type)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    type$ = combineLatest([
        getValueChanges(this.typeControl),
        metadata$,
        this.isForceRefObject$,
    ]).pipe(
        map(([fieldName, metadata, isForceRefObject]) =>
            this.getType(
                metadata,
                fieldName,
                isForceRefObject ? 'DomainObject' : 'ReflessDomainObject',
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    progress$ = new BehaviorSubject(0);
    isReview = false;

    ngOnInit() {
        if (this.dialogData && this.dialogData.objectType) {
            this.control.setValue({ [this.dialogData.objectType]: {} });
        }
    }

    create() {
        this.isForceRefObject$
            .pipe(
                first(),
                switchMap((isForceRefObject) => {
                    const fieldName = this.typeControl.value;
                    let insert: InsertOp;
                    if (isForceRefObject) {
                        const domainObject = this.control.value as ValuesType<DomainObject>;
                        insert = {
                            object: { [fieldName]: domainObject.data },
                            force_ref: { [fieldName]: domainObject.ref },
                        };
                    } else {
                        insert = {
                            object: {
                                [fieldName]: this.control.value as ValuesType<ReflessDomainObject>,
                            },
                        };
                    }
                    return this.domainService.commit([{ insert }]);
                }),
                progressTo(this.progress$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                this.log.successOperation('create', 'domain object');
                void this.navigateService.navigate(APP_ROUTES.domain.root, {
                    type: getUnionKey(this.control.value),
                });
                this.closeWithSuccess();
            });
    }

    private getType(
        metadata: ThriftAstMetadata[],
        fieldName: keyof ReflessDomainObject,
        type: string,
        namespace: string = 'domain',
    ) {
        return ((new ThriftData(metadata, namespace, type).ast || []) as Field[]).find(
            (t) => t.name === fieldName,
        )?.type;
    }
}
