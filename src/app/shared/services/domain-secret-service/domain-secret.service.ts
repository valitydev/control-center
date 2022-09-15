import { Injectable } from '@angular/core';
import { Snapshot } from '@vality/domain-proto/lib/domain_config';
import { KeycloakService } from 'keycloak-angular';

import { ThriftAstMetadata } from '../../../api/utils';
import { isDominantSecretRole } from './is-dominant-secret-role';
import { metadataReducer } from './metadata-reducer';

const DOMINANT_SECRETS_ROLE = 'dominant:secrets';

const EXCLUDE_OBJECTS = [
    { snapshotTerm: 'terminal', metadataTerm: 'TerminalObject' },
    { snapshotTerm: 'provider', metadataTerm: 'ProviderObject' },
    { snapshotTerm: 'proxy', metadataTerm: 'ProxyObject' },
];

@Injectable({
    providedIn: 'root',
})
export class DomainSecretService {
    private isDominantSecret = isDominantSecretRole(
        this.keycloakService.getUserRoles(),
        DOMINANT_SECRETS_ROLE
    );

    constructor(private keycloakService: KeycloakService) {}

    reduceMetadata(metadata: ThriftAstMetadata[]): ThriftAstMetadata[] {
        if (!this.isDominantSecret) {
            return metadata;
        }
        return metadata.reduce(metadataReducer(EXCLUDE_OBJECTS.map((o) => o.metadataTerm)), []);
    }

    reduceSnapshot(snapshot: Snapshot): Snapshot {
        if (!this.isDominantSecret) {
            return snapshot;
        }
        for (const [key] of snapshot.domain) {
            if (EXCLUDE_OBJECTS.map((o) => o.snapshotTerm).find((term) => key[term])) {
                snapshot.domain.delete(key);
            }
        }
        return snapshot;
    }
}
