import { Provider, Type } from '@angular/core';

import { provideValidators } from './provide-validators';
import { provideValueAccessor } from './provide-value-accessor';

/**
 * @deprecated
 * @param component
 */
export const createControlProviders = (component: () => Type<unknown>): Provider[] => [
    provideValueAccessor(component),
    provideValidators(component),
];
