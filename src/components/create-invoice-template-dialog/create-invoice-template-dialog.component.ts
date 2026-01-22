import { Subject, catchError, combineLatest, map, of, shareReplay, switchMap, tap } from 'rxjs';

import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { InvoiceTemplateCreateParams } from '@vality/domain-proto/api_extensions';
import { DialogModule, DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';

import { ThriftInvoiceTemplatingService } from '~/api/services';
import { ConfigService } from '~/services';

import { DomainThriftFormComponent } from '../thrift-api-crud';

@Component({
    templateUrl: './create-invoice-template-dialog.component.html',
    imports: [
        CommonModule,
        DialogModule,
        DomainThriftFormComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
    ],
})
export class CreateInvoiceTemplateDialogComponent extends DialogSuperclass<CreateInvoiceTemplateDialogComponent> {
    private invoiceTemplatingService = inject(ThriftInvoiceTemplatingService);
    private log = inject(NotifyLogService);
    private dr = inject(DestroyRef);
    private createTemplate$ = new Subject<null>();
    private configService = inject(ConfigService);
    private clipboard = inject(Clipboard);

    template$ = this.createTemplate$.pipe(
        switchMap(() =>
            this.invoiceTemplatingService.Create(this.control.value).pipe(
                progressTo(this.progress),
                tap(() => {
                    this.log.success('Invoice template created successfully');
                }),
                catchError((err) => {
                    this.log.error('Failed to create invoice template', err);
                    return of(null);
                }),
            ),
        ),
        takeUntilDestroyed(this.dr),
        shareReplay(1),
    );
    control = new FormControl<InvoiceTemplateCreateParams>(null, { nonNullable: true });
    progress = signal(0);
    link$ = combineLatest([this.template$, this.configService.config.value$]).pipe(
        map(([template, config]) => {
            const url = new URL(
                `http${(config.checkout.https ?? true) ? 's' : ''}://${config.checkout.hostname}${config.checkout.path ?? '/v1/checkout'}`,
            );
            url.searchParams.set('invoiceTemplateID', template.invoice_template.id);
            url.searchParams.set(
                'invoiceTemplateAccessToken',
                template.invoice_template_access_token.payload,
            );
            return url.toString();
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    create() {
        this.createTemplate$.next(null);
    }

    confirm() {
        this.closeWithSuccess();
    }

    copyLink() {
        this.link$.pipe(takeUntilDestroyed(this.dr)).subscribe((link) => {
            this.clipboard.copy(link);
            this.log.success('Link copied to clipboard');
        });
    }
}
