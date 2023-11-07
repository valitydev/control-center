import { generateId } from '@vality/domain-proto';

import { KeycloakToken } from './types';

export const toWachterHeaders =
    (service: string) =>
    ({ email, sub, preferred_username, token }: KeycloakToken) => {
        const id = generateId();
        return {
            service,
            authorization: `Bearer ${token}`,
            'x-woody-meta-user-identity-email': email,
            'x-woody-meta-user-identity-id': sub,
            'x-woody-meta-user-identity-realm': 'internal',
            'x-woody-meta-user-identity-username': preferred_username,
            'x-woody-parent-id': undefined,
            'x-woody-span-id': id,
            'x-woody-trace-id': id,
        };
    };
