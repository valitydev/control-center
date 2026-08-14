import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        release: typeof SENTRY_RELEASE === 'undefined' ? undefined : SENTRY_RELEASE,
        environment: isDevMode() ? 'development' : 'production',
        integrations: [
            Sentry.breadcrumbsIntegration({
                console: false,
            }),
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                maskAllInputs: true,
                blockAllMedia: true,
            }),
        ],
        tracesSampleRate: 1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1,
        enableLogs: false,
    });
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
