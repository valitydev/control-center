import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeRu from '@angular/common/locales/ru';
import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputMaskModule } from '@ngneat/input-mask';
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
import { ERROR_PARSER, LogError, NavComponent, QUERY_PARAMS_SERIALIZERS } from '@vality/matez';
import { MonacoEditorModule } from '@vality/ng-thrift';
import { RepairManagement } from '@vality/repairer-proto/repairer';
import { AccountService } from '@vality/scrooge-proto/account_balance';
import { provideKeycloak } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { ConfigService } from '../services';
import { parseThriftError, provideThriftServices } from '../utils';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SectionsModule } from './sections/sections.module';
import { CandidateCardComponent } from './shared/components/candidate-card/candidate-card.component';
import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponent } from './shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from './shared/components/terminal-delegates-card/terminal-delegates-card.component';
import { DomainObjectCardComponent } from './shared/components/thrift-api-crud/domain2';
import {
    DATE_RANGE_DAYS,
    DEBOUNCE_TIME_MS,
    DEFAULT_DATE_RANGE_DAYS,
    DEFAULT_DEBOUNCE_TIME_MS,
    DEFAULT_MAT_DATE_FORMATS,
    DEFAULT_QUERY_PARAMS_SERIALIZERS,
} from './tokens';

registerLocaleData(localeRu);

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatListModule,
        SectionsModule,
        SidenavInfoComponent,
        NavComponent,
        MonacoEditorModule.forRoot({
            requireConfig: {
                paths: {
                    // TODO: https://github.com/microsoft/monaco-editor/issues/4778
                    vs: window.location.origin + '/assets/monaco/min/vs',
                },
            },
        }),
        // TODO: hack for metadata datetime 😡
        MatDatepickerModule,
        // TODO: hack for cash field 😡
        InputMaskModule,
        MatChipsModule,
        MatTooltipModule,
    ],
    providers: [
        ConfigService,
        provideKeycloak({
            config: environment.authConfigPath as never,
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
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private matIconRegistry: MatIconRegistry) {
        this.registerIcons();
    }

    registerIcons(): void {
        this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    }
}
