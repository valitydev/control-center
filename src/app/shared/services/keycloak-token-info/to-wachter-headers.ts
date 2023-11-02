import { generateId } from '@vality/domain-proto';

import { KeycloakToken } from './types';

export const toWachterHeaders =
    (service: string, isAddIdsHeaders = false) =>
    ({ email, sub, preferred_username, token }: KeycloakToken) => {
        const id = generateId();
        return {
            service,
            'woody.meta.user-identity.email': email,
            'woody.meta.user-identity.id': sub,
            'woody.meta.user-identity.realm': 'internal',
            'woody.meta.user-identity.username': preferred_username,
            authorization: `Bearer ${token}`,
            ...(isAddIdsHeaders && {
                'woody.parent-id': undefined,
                'woody.span-id': id,
                'woody.trace-id': id,
            }),
        };
    };
