import { generateId } from '@vality/domain-proto';

export const createWachterHeaders = (
    service: string,
    user: { token: string; id: string; username?: string; email?: string },
) => ({
    service,
    authorization: `Bearer ${user.token}`,
    'x-woody-meta-user-identity-email': user.email,
    'x-woody-meta-user-identity-id': user.id,
    'x-woody-meta-user-identity-realm': 'internal',
    'x-woody-meta-user-identity-username': user.username,
    'x-woody-parent-id': undefined,
});

export const createRequestWachterHeaders = () => {
    const traceId = generateId();
    return {
        'x-woody-span-id': traceId,
        'x-woody-trace-id': traceId,
    };
};
