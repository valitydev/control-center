export const SCOPES = ['Shop', 'Wallet'] as const;

export type ScopeId = (typeof SCOPES)[number];
