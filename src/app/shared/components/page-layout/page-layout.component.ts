import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'cc-page-layout',
    templateUrl: './page-layout.component.html',
    styleUrls: ['./page-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent {
    @Input() title!: string;
    @Input() description?: string;
}
