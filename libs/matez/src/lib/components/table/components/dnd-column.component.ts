
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { BaseColumnComponent } from './base-column.component';

@Component({
    selector: 'v-dnd-column',
    template: `
        <ng-container [matColumnDef]="name()" [sticky]="true">
            @let columnClasses = 'column';
            <th *matHeaderCellDef [class]="columnClasses" mat-header-cell></th>
            <td *matCellDef="let row" [class]="columnClasses" mat-cell>
                <div class="position">
                    <mat-icon class="dragCursor" (mousedown)="dragged.emit()">reorder</mat-icon>
                    <!-- <span>{{ index + 1 }}</span>-->
                </div>
            </td>
            <td *matFooterCellDef [class]="columnClasses" mat-footer-cell>
                <div class="position">
                    <mat-icon class="dragCursor">reorder</mat-icon>
                </div>
            </td>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTableModule, MatIconModule],
    styles: `
        .column {
            .position {
                display: flex;
                align-items: center;
                gap: 8px;

                .dragCursor {
                    cursor: move;
                }
            }
        }
    `,
})
export class DndColumnComponent extends BaseColumnComponent {
    dragged = output();
}
