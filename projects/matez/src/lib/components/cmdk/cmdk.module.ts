import { NgModule } from '@angular/core';

import { CmdkService } from './cmdk.service';
import { CmdkButtonComponent } from './components/cmdk-button.component';

@NgModule({
    imports: [CmdkButtonComponent],
    providers: [CmdkService],
    exports: [CmdkButtonComponent],
})
export class CmdkModule {}
