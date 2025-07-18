import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'v-cmdk',
    imports: [MatDialogModule, MatButtonModule, MatInputModule, MatListModule, MatIconModule],
    templateUrl: './cmdk.component.html',
    styleUrl: './cmdk.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmdkComponent {}
