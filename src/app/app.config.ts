import { provideKeycloak } from 'keycloak-angular';

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

import { ERROR_PARSER, LogError, QUERY_PARAMS_SERIALIZERS } from '@vality/matez';
import { provideMonacoEditor } from '@vality/ng-monaco-editor';

import { provideThriftServices } from '~/api/services';
import { CandidateCardComponent } from '~/components/candidate-card/candidate-card.component';
import { SIDENAV_INFO_COMPONENTS } from '~/components/sidenav-info';
import { TerminalDelegatesCardComponent } from '~/components/terminal-delegates-card/terminal-delegates-card.component';
import { DomainObjectHistoryCardComponent } from '~/components/thrift-api-crud';
import { DomainObjectCardComponent } from '~/components/thrift-api-crud/domain/domain-object-card/domain-object-card.component';
import { parseThriftError } from '~/utils';

import { routes } from './app.routes';
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
                domainObjectHistory: DomainObjectHistoryCardComponent,
                terminalDelegates: TerminalDelegatesCardComponent,
                candidate: CandidateCardComponent,
            },
        },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
        MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
        provideThriftServices(),
        provideMonacoEditor(),
        provideAppInitializer(() => {
            const iconRegistry = inject(MatIconRegistry);
            iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
        }),
    ],
};
