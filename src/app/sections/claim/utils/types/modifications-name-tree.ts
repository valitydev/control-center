import { Modification } from '@vality/domain-proto/claim_management';

type ModificationsNameTree<T> = { [N in keyof T]?: ModificationsNameTree<T[N]> | string };

export const MODIFICATIONS_NAME_TREE: ModificationsNameTree<Modification> = {
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
                creation: 'Old Wallet Creation',
                account_creation: 'Old Wallet Account Creation',
            },
        },
        additional_info_modification: {
            party_name: 'Party Name',
            manager_contact_emails: 'Party Manager Contact Emails',
            comment: 'Party Comment',
        },
    },
    identity_modification: {
        modification: {
            creation: 'Identity Creation',
        },
    },
    wallet_modification: {
        modification: {
            creation: 'Wallet Creation',
        },
    },
};
