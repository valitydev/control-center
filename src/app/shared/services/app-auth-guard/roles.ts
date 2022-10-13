export enum PaymentAdjustmentRole {
    Create = 'adjustment:create',
}

export enum OperationRole {
    SearchOperations = 'search_ops',
    SearchPayments = 'search_payments',
    SearchDeposits = 'search_deposits',
}

export enum PayoutRole {
    Read = 'payout:read',
}

export enum PartyRole {
    Get = 'party:get',
}

export enum DepositRole {
    Write = 'deposit:write',
}

export enum DomainConfigRole {
    Checkout = 'dmt:checkout',
}

export enum ClaimManagementRole {
    GetClaims = 'get_claims',
    RequestClaimReview = 'request_claim_review',
    RequestClaimChanges = 'request_claim_changes',
    DenyClaim = 'deny_claim',
    RevokeClaim = 'revoke_claim',
    AcceptClaim = 'accept_claim',
}
