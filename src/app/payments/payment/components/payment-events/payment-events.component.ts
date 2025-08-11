import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { Invoicing } from '@vality/domain-proto/payment_processing';
import { ThriftPipesModule } from '@vality/ng-thrift';
import { switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { PageLayoutModule } from '../../../../shared';
import { DomainThriftViewerComponent } from '../../../../shared/components/thrift-api-crud';
import { PaymentDetailsService } from '../../payment.service';

import { TimelineItemHeaderComponent } from './components/timeline-item-header/timeline-item-header.component';
import { getInvoiceChangeInfo } from './utils/get-invoice-change-info';

import { TimelineModule } from '~/components/timeline';

@Component({
    selector: 'cc-payment-events',
    imports: [
        CommonModule,
        PageLayoutModule,
        TimelineModule,
        MatIcon,
        ThriftPipesModule,
        DomainThriftViewerComponent,
        MatExpansionModule,
        TimelineItemHeaderComponent,
    ],
    templateUrl: './payment-events.component.html',
    styles: ``,
})
export class PaymentEventsComponent {
    private paymentDetailsService = inject(PaymentDetailsService);
    private invoicingService = inject(Invoicing);
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    events$ = this.payment$.pipe(
        switchMap((payment) => this.invoicingService.GetEvents(payment.invoice_id, {})),
        map((events) =>
            events.flatMap((e) =>
                (e.payload.invoice_changes || []).map((change) => getInvoiceChangeInfo(e, change)),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
}
