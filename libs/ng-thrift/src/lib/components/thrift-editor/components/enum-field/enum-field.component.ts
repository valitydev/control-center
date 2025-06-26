
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';

import { ThriftData } from '../../../../models';
import { FieldLabelPipe } from '../../pipes/field-label.pipe';

@Component({
    selector: 'v-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(() => EnumFieldComponent),
    imports: [
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FieldLabelPipe,
    MatButtonModule
],
})
export class EnumFieldComponent<T> extends FormControlSuperclass<T> {
    @Input() data!: ThriftData<string, 'enum'>;
}
