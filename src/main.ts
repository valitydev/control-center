import { bootstrapApplication } from '@angular/platform-browser';

// eslint-disable-next-line paths/alias
import { AppComponent } from './app/app.component';
// eslint-disable-next-line paths/alias
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
