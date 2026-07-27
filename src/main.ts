import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
        tracesSampleRate: 1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1,
        enableLogs: true,
    });
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
