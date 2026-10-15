import { loadThriftMetadataByNamespaces } from '@vality/domain-proto';
import { Accounter } from '@vality/domain-proto/accounter';
import { InvoiceTemplating } from '@vality/domain-proto/api_extensions';
import {
    AuthorManagement,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { Invoicing, PartyManagement } from '@vality/domain-proto/payment_processing';
import { WebhookManager } from '@vality/domain-proto/webhooker';
import { createObservableService } from '@vality/tsthrift-angular';

import { Service } from '~/services';

export const ThriftRepositoryService = createObservableService(Repository, {
    headers: (h) => ({ ...h, service: Service.DMT }),
});
export const ThriftRepositoryClientService = createObservableService(RepositoryClient, {
    headers: (h) => ({ ...h, service: Service.DMTClient }),
});
export const ThriftAuthorManagementService = createObservableService(AuthorManagement, {
    headers: (h) => ({ ...h, service: Service.DMTAuthor }),
});
export const ThriftInvoicingService = createObservableService(Invoicing, {
    headers: (h) => ({ ...h, service: Service.Invoicing }),
});
export const ThriftPartyManagementService = createObservableService(PartyManagement, {
    headers: (h) => ({ ...h, service: Service.PartyManagement }),
});
export const ThriftShopWebhooksManagementService = createObservableService(WebhookManager, {
    headers: (h) => ({ ...h, service: Service.WebhookManager }),
});
export const ThriftAccountManagementService = createObservableService(Accounter, {
    headers: (h) => ({ ...h, service: Service.Accounter }),
});
export const ThriftInvoiceTemplatingService = createObservableService(InvoiceTemplating, {
    headers: (h) => ({ ...h, service: Service.InvoiceTemplating }),
});

export function loadDomainMetadata() {
    return loadThriftMetadataByNamespaces([
        'domain_config_v2',
        'payment_processing',
        'webhooker',
        'accounter',
        'api_extensions',
    ]);
}
