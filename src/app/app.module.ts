import { LOCALE_ID, NgModule } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_DIALOG_CONFIG, DIALOG_CONFIG } from '@vality/ng-core';
import * as moment from 'moment';

import 'moment/locale/ru';

import {
    KeycloakTokenInfoModule,
    QUERY_PARAMS_SERIALIZERS,
    MomentUtcDateAdapter,
} from '@cc/app/shared/services';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { DomainModule } from './domain';
import icons from './icons.json';
import { NotFoundModule } from './not-found';
import { RepairingModule } from './repairing/repairing.module';
import { ClaimModule } from './sections/claim';
import { DomainConfigModule } from './sections/domain-config';
import { OperationsModule } from './sections/operations/operations.module';
import { PaymentAdjustmentModule } from './sections/payment-adjustment/payment-adjustment.module';
import { PayoutsModule } from './sections/payouts';
import { SearchClaimsModule } from './sections/search-claims/search-claims.module';
import { SearchPartiesModule } from './sections/search-parties/search-parties.module';
import { SectionsModule } from './sections/sections.module';
import { ThemeManager, ThemeManagerModule, ThemeName } from './theme-manager';
import {
    DEFAULT_MAT_DATE_FORMATS,
    DEFAULT_QUERY_PARAMS_SERIALIZERS,
    DEFAULT_SEARCH_LIMIT,
    DEFAULT_SMALL_SEARCH_LIMIT,
    SEARCH_LIMIT,
    SMALL_SEARCH_LIMIT,
} from './tokens';

/**
 * For use in specific locations (for example, questionary PDF document)
 */
moment.locale('en');

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        CoreModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatListModule,
        PaymentAdjustmentModule,
        DomainModule,
        RepairingModule,
        ThemeManagerModule,
        SearchPartiesModule,
        SearchClaimsModule,
        OperationsModule,
        DomainConfigModule,
        KeycloakTokenInfoModule,
        PayoutsModule,
        ClaimModule,
        SectionsModule,
        // It is important that NotFoundModule module should be last
        NotFoundModule,
    ],
    providers: [
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: MAT_DATE_FORMATS, useValue: DEFAULT_MAT_DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentUtcDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_LOCALE, useValue: 'en' },
        { provide: LOCALE_ID, useValue: 'en' },
        { provide: SEARCH_LIMIT, useValue: DEFAULT_SEARCH_LIMIT },
        { provide: SMALL_SEARCH_LIMIT, useValue: DEFAULT_SMALL_SEARCH_LIMIT },
        { provide: DIALOG_CONFIG, useValue: DEFAULT_DIALOG_CONFIG },
        { provide: QUERY_PARAMS_SERIALIZERS, useValue: DEFAULT_QUERY_PARAMS_SERIALIZERS },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(
        private themeManager: ThemeManager,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        this.themeManager.change(ThemeName.Light);
        this.registerIcons();
    }

    registerIcons(): void {
        for (const name of icons) {
            this.matIconRegistry.addSvgIcon(
                name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(`../assets/icons/${name}.svg`)
            );
        }
    }
}
