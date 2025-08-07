import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeRu from '@angular/common/locales/ru';
import {
    ApplicationConfig,
    LOCALE_ID,
    inject,
    isDevMode,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@angular/material/autocomplete';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconRegistry } from '@angular/material/icon';
import { provideRouter, withRouterConfig } from '@angular/router';
import {
    AuthorManagement,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { Invoicing, PartyManagement } from '@vality/domain-proto/payment_processing';
import { DominatorService } from '@vality/dominator-proto/dominator';
import { Management as DepositManagement } from '@vality/fistful-proto/deposit';
import { FistfulStatistics } from '@vality/fistful-proto/fistful_stat';
import { Management as SourceManagement } from '@vality/fistful-proto/source';
import { Management as WithdrawalManagement } from '@vality/fistful-proto/withdrawal';
import { Automaton } from '@vality/machinegun-proto/state_processing';
import { MerchantStatisticsService } from '@vality/magista-proto/magista';
import { ERROR_PARSER, LogError, QUERY_PARAMS_SERIALIZERS } from '@vality/matez';
import { provideMonacoEditor } from '@vality/ng-thrift';
import { RepairManagement } from '@vality/repairer-proto/repairer';
import { AccountService } from '@vality/scrooge-proto/account_balance';
import { provideKeycloak } from 'keycloak-angular';

import { parseThriftError, provideThriftServices } from '../utils';

import { routes } from './app.routes';
import { CandidateCardComponent } from './shared/components/candidate-card/candidate-card.component';
import { SIDENAV_INFO_COMPONENTS } from './shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from './shared/components/terminal-delegates-card/terminal-delegates-card.component';
import { DomainObjectCardComponent } from './shared/components/thrift-api-crud/domain/domain-object-card/domain-object-card.component';
import {
    DATE_RANGE_DAYS,
    DEBOUNCE_TIME_MS,
    DEFAULT_DATE_RANGE_DAYS,
    DEFAULT_DEBOUNCE_TIME_MS,
    DEFAULT_MAT_DATE_FORMATS,
    DEFAULT_QUERY_PARAMS_SERIALIZERS,
} from './tokens';

registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideKeycloak({
            config: './assets/authConfig.json' as never,
            initOptions: { onLoad: 'login-required', checkLoginIframe: !isDevMode() },
        }),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: MAT_DATE_FORMATS, useValue: DEFAULT_MAT_DATE_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: LOCALE_ID, useValue: 'ru' },
        { provide: QUERY_PARAMS_SERIALIZERS, useValue: DEFAULT_QUERY_PARAMS_SERIALIZERS },
        { provide: DATE_RANGE_DAYS, useValue: DEFAULT_DATE_RANGE_DAYS },
        { provide: DEBOUNCE_TIME_MS, useValue: DEFAULT_DEBOUNCE_TIME_MS },
        {
            provide: ERROR_PARSER,
            useValue: (err) => {
                const parsedError = parseThriftError(err) as LogError;
                parsedError.noConsole = parsedError.name !== 'UnknownError';
                return parsedError;
            },
        },
        {
            provide: SIDENAV_INFO_COMPONENTS,
            useValue: {
                domainObject: DomainObjectCardComponent,
                terminalDelegates: TerminalDelegatesCardComponent,
                candidate: CandidateCardComponent,
            },
        },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
        MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
        provideThriftServices([
            { service: RepairManagement, name: 'RepairManagement' },
            { service: AccountService, name: 'Scrooge' },
            { service: MerchantStatisticsService, name: 'MerchantStatistics' },
            { service: DominatorService, name: 'Dominator' },
            { service: Automaton, name: 'Automaton' },
            { service: Invoicing, name: 'Invoicing' },
            { service: PartyManagement, name: 'PartyManagement' },
            { service: Repository, name: 'DMT' },
            { service: RepositoryClient, name: 'DMTClient' },
            { service: AuthorManagement, name: 'DMTAuthor' },
            { service: DepositManagement, name: 'DepositManagement' },
            { service: FistfulStatistics, name: 'FistfulStatistics' },
            { service: WithdrawalManagement, name: 'WithdrawalManagement' },
            { service: SourceManagement, name: 'SourceManagement' },
        ]),
        provideMonacoEditor({
            requireConfig: {
                paths: {
                    // TODO: https://github.com/microsoft/monaco-editor/issues/4778
                    vs: window.location.origin + '/assets/monaco/min/vs',
                },
            },
        }),
        provideAppInitializer(() => {
            const iconRegistry = inject(MatIconRegistry);
            iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
        }),
    ],
};
