import { Provider, forwardRef, Type } from '@angular/core';
import { NG_VALIDATORS } from '@angular/forms';

/**
 * @deprecated
 * @param component
 */
export const provideValidators = (component: () => Type<unknown>): Provider => ({
    provide: NG_VALIDATORS,
    useExisting: forwardRef(component),
    multi: true,
});
