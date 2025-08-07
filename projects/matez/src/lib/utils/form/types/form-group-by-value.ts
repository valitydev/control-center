import { FormControl, FormGroup } from '@angular/forms';

export type FormGroupByValue<T> = FormGroup<{
    [N in keyof T]: FormControl<T[N]>;
}>;
