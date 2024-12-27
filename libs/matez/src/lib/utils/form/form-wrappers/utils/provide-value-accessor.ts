import { Provider, forwardRef, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export const provideValueAccessor = (component: () => Type<unknown>): Provider => ({
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(component),
    multi: true,
});
