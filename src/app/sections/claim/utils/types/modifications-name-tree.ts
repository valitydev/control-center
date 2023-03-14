import {
    CashRegisterModificationUnit,
    ClaimModification,
    CommentModificationUnit,
    ContractAdjustmentModificationUnit,
    ContractModificationUnit,
    ContractorModificationUnit,
    DocumentModificationUnit,
    FileModificationUnit,
    Modification,
    PartyModification,
    PayoutToolModificationUnit,
    ShopModificationUnit,
    StatusModificationUnit,
    WalletModificationUnit,
    WalletModification,
    IdentityModification,
} from '@vality/domain-proto/claim_management';
import { Overwrite } from 'utility-types';

type OverwriteAll<T extends object, U extends { [N in keyof T]-?: unknown }> = U;

type ModificationsName<T extends object> = {
    [P in keyof T]-?: string;
};
type ModificationUnitsName<
    T extends { modification: object },
    O extends { [N in keyof T['modification']]?: unknown } = Record<never, never>
> = {
    modification: Overwrite<ModificationsName<T['modification']>, O>;
};

type ModificationsNameTree = OverwriteAll<
    Modification,
    {
        claim_modification: OverwriteAll<
            ClaimModification,
            {
                document_modification: ModificationUnitsName<DocumentModificationUnit>;
                file_modification: ModificationUnitsName<FileModificationUnit>;
                comment_modification: ModificationUnitsName<CommentModificationUnit>;
                status_modification: ModificationUnitsName<StatusModificationUnit>;
                external_info_modification: string;
            }
        >;
        party_modification: OverwriteAll<
            PartyModification,
            {
                contractor_modification: ModificationUnitsName<ContractorModificationUnit>;
                contract_modification: ModificationUnitsName<
                    ContractModificationUnit,
                    {
                        adjustment_modification: ModificationUnitsName<ContractAdjustmentModificationUnit>;
                        payout_tool_modification: ModificationUnitsName<PayoutToolModificationUnit>;
                    }
                >;
                shop_modification: ModificationUnitsName<
                    ShopModificationUnit,
                    {
                        cash_register_modification_unit: ModificationUnitsName<CashRegisterModificationUnit>;
                    }
                >;
                wallet_modification: ModificationUnitsName<WalletModificationUnit>;
            }
        >;
        identity_modification: OverwriteAll<
            IdentityModification,
            {
                creation: string;
            }
        >;
        wallet_modification: OverwriteAll<
            WalletModification,
            {
                creation: string;
                account_creation: string;
            }
        >;
    }
>;

export const MODIFICATIONS_NAME_TREE: ModificationsNameTree = {
    claim_modification: {
        document_modification: {
            modification: {
                creation: 'Document Creation',
                changed: 'Document Change',
            },
        },
        file_modification: {
            modification: {
                creation: 'File Creation',
                deletion: 'File Deletion',
                changed: 'File Change',
            },
        },
        comment_modification: {
            modification: {
                creation: 'Comment Creation',
                changed: 'Comment Change',
                deletion: 'Comment Deletion',
            },
        },
        status_modification: {
            modification: {
                change: 'Status Change',
            },
        },
        external_info_modification: 'External Info',
    },
    party_modification: {
        contractor_modification: {
            modification: {
                creation: 'Contractor Creation',
                identification_level_modification: 'Contractor Identification Level',
            },
        },
        contract_modification: {
            modification: {
                creation: 'Contract Creation',
                termination: 'Contract Termination',
                adjustment_modification: {
                    modification: {
                        creation: 'Contract Adjustment Creation',
                    },
                },
                payout_tool_modification: {
                    modification: {
                        creation: 'Contract Payout Tool Creation',
                        info_modification: 'Contract Payout Tool Info',
                    },
                },
                legal_agreement_binding: 'Contract Legal Agreement Binding',
                report_preferences_modification: 'Contract Report Preferences',
                contractor_modification: 'Contract Contractor',
            },
        },
        shop_modification: {
            modification: {
                creation: 'Shop Creation',
                category_modification: 'Shop Category',
                details_modification: 'Shop Details',
                contract_modification: 'Shop Contract',
                payout_tool_modification: 'Shop Payout Tool',
                location_modification: 'Shop Location',
                shop_account_creation: 'Shop Account Creation',
                payout_schedule_modification: 'Shop Schedule',
                cash_register_modification_unit: {
                    modification: {
                        creation: 'Shop Cash Register Creation',
                    },
                },
            },
        },
        wallet_modification: {
            modification: {
                creation: 'Wallet Creation',
                account_creation: 'Wallet Account Creation',
            },
        },
    },
    identity_modification: {
        creation: 'Identity Creation',
    },
    wallet_modification: {
        creation: 'Wallet Creation',
        account_creation: 'Wallet Account Creation',
    },
};
