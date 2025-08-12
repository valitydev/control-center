import { createThriftServices } from '~/utils';

const SERVICES = [
    {
        name: 'DMT',
        loader: () => import('@vality/domain-proto/domain_config_v2').then((m) => m.Repository),
    },
    {
        name: 'DMTClient',
        loader: () =>
            import('@vality/domain-proto/domain_config_v2').then((m) => m.RepositoryClient),
    },
    {
        name: 'DMTAuthor',
        loader: () =>
            import('@vality/domain-proto/domain_config_v2').then((m) => m.AuthorManagement),
    },
    {
        name: 'RepairManagement',
        loader: () => import('@vality/repairer-proto/repairer').then((m) => m.RepairManagement),
    },
    {
        name: 'Scrooge',
        loader: () => import('@vality/scrooge-proto/account_balance').then((m) => m.AccountService),
    },
    {
        name: 'MerchantStatistics',
        loader: () =>
            import('@vality/magista-proto/magista').then((m) => m.MerchantStatisticsService),
    },
    {
        name: 'Dominator',
        loader: () => import('@vality/dominator-proto/dominator').then((m) => m.DominatorService),
    },
    {
        name: 'Automaton',
        loader: () => import('@vality/machinegun-proto/state_processing').then((m) => m.Automaton),
    },
    {
        name: 'Invoicing',
        loader: () => import('@vality/domain-proto/payment_processing').then((m) => m.Invoicing),
    },
    {
        name: 'PartyManagement',
        loader: () =>
            import('@vality/domain-proto/payment_processing').then((m) => m.PartyManagement),
    },
    {
        name: 'DepositManagement',
        loader: () => import('@vality/fistful-proto/deposit').then((m) => m.Management),
    },
    {
        name: 'FistfulStatistics',
        loader: () => import('@vality/fistful-proto/fistful_stat').then((m) => m.FistfulStatistics),
    },
    {
        name: 'WithdrawalManagement',
        loader: () => import('@vality/fistful-proto/withdrawal').then((m) => m.Management),
    },
    {
        name: 'SourceManagement',
        loader: () => import('@vality/fistful-proto/source').then((m) => m.Management),
    },
] as const;

export const {
    services: {
        DMT: ThriftRepositoryService,
        DMTClient: ThriftRepositoryClientService,
        DMTAuthor: ThriftAuthorManagementService,
        RepairManagement: ThriftRepairManagementService,
        Scrooge: ThriftAccountService,
        MerchantStatistics: ThriftMerchantStatisticsService,
        Dominator: ThriftDominatorService,
        Automaton: ThriftAutomatonService,
        Invoicing: ThriftInvoicingService,

        PartyManagement: ThriftPartyManagementService,
        DepositManagement: ThriftDepositManagementService,
        FistfulStatistics: ThriftFistfulStatisticsService,
        WithdrawalManagement: ThriftWithdrawalManagementService,
        SourceManagement: ThriftSourceManagementService,
    },
    provideThriftServices,
} = createThriftServices(SERVICES);
