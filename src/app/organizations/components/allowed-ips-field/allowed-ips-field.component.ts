import { ChangeDetectionStrategy, Component, effect, input, model, output } from '@angular/core';
import { FormField, FormValueControl, disabled, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InputFieldModule } from '@vality/matez';

@Component({
    selector: 'cc-allowed-ips-field',
    imports: [FormField, InputFieldModule, MatButtonModule, MatIconModule],
    templateUrl: './allowed-ips-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllowedIpsFieldComponent implements FormValueControl<string[]> {
    value = model<string[]>([]);
    disabled = input(false);
    touch = output<void>();

    control = form(this.value, (path) => {
        disabled(path, () => this.disabled());
    });

    constructor() {
        effect(() => {
            const addresses = this.value();
            if (!addresses.length || addresses.at(-1).trim()) {
                this.value.set([...addresses, '']);
            }
        });
    }

    remove(index: number) {
        this.value.update((addresses) => addresses.filter((_, i) => i !== index));
        this.touch.emit();
    }
}
