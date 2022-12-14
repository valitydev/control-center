import { Provider, Type } from '@angular/core';
import { provideValueAccessor } from '@s-libs/ng-core';

import { provideValidator } from './provide-validator';

export const createControlProviders = (component: Type<unknown>): Provider[] => [
    provideValueAccessor(component),
    provideValidator(component),
];
