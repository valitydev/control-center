const createPrefixedHeaders = (params: Record<string, string>, prefix: string) =>
    Object.fromEntries(Object.entries(params).map(([k, v]) => [prefix + k, v]));

export type UserIdentityHeaderParams = Record<'email' | 'username' | 'id' | 'realm', string>;

const DEFAULT_USER_IDENTITY_HEADER_PARAMS: Partial<UserIdentityHeaderParams> = {
    realm: 'internal',
};

export const createUserIdentityHeaders = (params: Partial<UserIdentityHeaderParams>) =>
    createPrefixedHeaders(
        { ...DEFAULT_USER_IDENTITY_HEADER_PARAMS, ...params },
        'woody.meta.user-identity.'
    );

export const createDeprecatedUserIdentityHeaders = (params: Partial<UserIdentityHeaderParams>) =>
    createPrefixedHeaders(
        { ...DEFAULT_USER_IDENTITY_HEADER_PARAMS, ...params },
        'x-rbk-meta-user-identity.'
    );

export const createAuthorizationHeaders = (token: string) => ({
    authorization: `Bearer ${token}`,
});

export const createWachterHeaders = (serviceName: string) => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Service: serviceName,
});
