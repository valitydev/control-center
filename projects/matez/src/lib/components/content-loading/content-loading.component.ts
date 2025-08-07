import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { random } from 'lodash-es';

@Component({
    selector: 'v-content-loading',
    templateUrl: './content-loading.component.html',
    styleUrls: ['./content-loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
})
export class ContentLoadingComponent {
    width = input(random(35, 80) + '%');
    textSize = input(0, { transform: numberAttribute });
    hiddenText = input<string | undefined | null>();
}
