import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { NotifyLogService } from './notify-log.service';

@NgModule({
    imports: [MatSnackBarModule],
    providers: [NotifyLogService],
})
export class LogModule {}
