import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'v-cmdk',
    imports: [MatDialogModule, MatButtonModule, MatInputModule],
    templateUrl: './cmdk.component.html',
    styleUrl: './cmdk.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmdkComponent {}
