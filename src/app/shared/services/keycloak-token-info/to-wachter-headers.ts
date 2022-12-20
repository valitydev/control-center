import { KeycloakToken } from './types';

export const toWachterHeaders =
    (service: string) =>
    ({ email, sub, preferred_username, token }: KeycloakToken) => ({
        service,
        'woody.meta.user-identity.email': email,
        'woody.meta.user-identity.id': sub,
        'woody.meta.user-identity.realm': 'internal',
        'woody.meta.user-identity.username': preferred_username,
        authorization: `Bearer ${token}`,
    });
