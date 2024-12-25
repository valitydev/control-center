import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { FileUploadComponent } from './file-upload.component';

@NgModule({
    declarations: [FileUploadComponent],
    exports: [FileUploadComponent],
    imports: [CommonModule, MatButtonModule],
})
export class FileUploadModule {}
