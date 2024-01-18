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
    progressTo,
    NotifyLogService,
} from '@vality/ng-core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { getUnionKey } from '../../../../../../utils';
import { DomainStoreService } from '../../../../../api/domain-config';
import { DomainNavigateService } from '../../../../../sections/domain/services/domain-navigate.service';
import { MetadataService } from '../../../../../sections/domain/services/metadata.service';
import { DomainThriftFormComponent } from '../domain-thrift-form';
import { DomainThriftViewerComponent } from '../domain-thrift-viewer';

@Component({
    selector: 'cc-create-domain-object-dialog',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        DomainThriftViewerComponent,
    ],
    templateUrl: './create-domain-object-dialog.component.html',
})
export class CreateDomainObjectDialogComponent extends DialogSuperclass<CreateDomainObjectDialogComponent> {
    static defaultDialogConfig: ValuesType<DialogConfig> = {
        ...DEFAULT_DIALOG_CONFIG.large,
        minHeight: DEFAULT_DIALOG_CONFIG_FULL_HEIGHT,
    };

    control = new FormControl<DomainObject | null>(null, [Validators.required]);
    progress$ = new BehaviorSubject(0);
    isReview = false;

    constructor(
        private domainStoreService: DomainStoreService,
        private destroyRef: DestroyRef,
        private log: NotifyLogService,
        private domainNavigateService: DomainNavigateService,
        private metadataService: MetadataService,
    ) {
        super();
    }

    create() {
        this.domainStoreService
            .commit({ ops: [{ insert: { object: this.control.value } }] })
            .pipe(
                switchMap(() => this.getType()),
                progressTo(this.progress$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (type) => {
                    this.log.successOperation('create', 'domain object');
                    void this.domainNavigateService.toType(String(type));
                    this.closeWithSuccess();
                },
                error: this.log.error,
            });
    }

    private getType() {
        return this.metadataService.getDomainFieldByName(getUnionKey(this.control.value)).pipe(
            map((f) => String(f.type)),
            first(),
        );
    }
}
